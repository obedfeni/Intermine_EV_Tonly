import { NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const today = new Date(); today.setHours(0,0,0,0)
  const [totalTrucks,activeTrucks,faultyTrucks,maintenanceTrucks,chargingTrucks,idleTrucks,openFaults,criticalFaults,pendingTasks,todayCharging,recentFaults,recentTasks,truckStatusDist] = await Promise.all([
    prisma.truck.count(),
    prisma.truck.count({ where:{ status:'ACTIVE' } }),
    prisma.truck.count({ where:{ status:'FAULTY' } }),
    prisma.truck.count({ where:{ status:'MAINTENANCE' } }),
    prisma.truck.count({ where:{ status:'CHARGING' } }),
    prisma.truck.count({ where:{ status:'IDLE' } }),
    prisma.fault.count({ where:{ status:{ in:['OPEN','IN_PROGRESS'] } } }),
    prisma.fault.count({ where:{ severity:'CRITICAL', status:{ not:'RESOLVED' } } }),
    prisma.task.count({ where:{ status:{ in:['PENDING','ASSIGNED','IN_PROGRESS'] } } }),
    prisma.chargingLog.findMany({ where:{ startTime:{ gte:today } }, select:{ kwhDelivered:true, cost:true } }),
    prisma.fault.findMany({ take:8, include:{ truck:{ select:{ truckId:true, model:true } }, reporter:{ select:{ name:true } } }, orderBy:{ createdAt:'desc' } }),
    prisma.task.findMany({ take:8, include:{ truck:{ select:{ truckId:true } }, assignee:{ select:{ name:true } } }, where:{ status:{ in:['PENDING','ASSIGNED','IN_PROGRESS'] } }, orderBy:{ createdAt:'desc' } }),
    prisma.truck.groupBy({ by:['status'], _count:{ status:true } }),
  ])
  return NextResponse.json({
    stats:{ totalTrucks,activeTrucks,faultyTrucks,maintenanceTrucks,chargingTrucks,idleTrucks,openFaults,criticalFaults,pendingTasks,todayChargingSessions:todayCharging.length,totalKwhToday:todayCharging.reduce((s,l)=>s+(l.kwhDelivered||0),0),totalCostToday:todayCharging.reduce((s,l)=>s+(l.cost||0),0) },
    recentFaults, recentTasks,
    truckStatusDist: truckStatusDist.map(d=>({ name:d.status, value:d._count.status })),
  })
}
