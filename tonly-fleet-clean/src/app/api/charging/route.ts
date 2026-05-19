import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const logs = await prisma.chargingLog.findMany({
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, operator:{ select:{ name:true, email:true } } },
    orderBy:{ startTime:'desc' },
  })
  return NextResponse.json(logs)
}
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const role = (session.user as any).role
  if (!['CHARGING_OPERATOR','SUPERVISOR'].includes(role)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const body = await req.json()
  if (Array.isArray(body)) {
    const created = await prisma.chargingLog.createMany({ data: body.map((row: any) => ({ ...row, operatorId:session.user.id! })) })
    return NextResponse.json({ count:created.count }, { status:201 })
  }
  const log = await prisma.chargingLog.create({
    data:{
      truckId:body.truckId, operatorId:session.user.id!,
      startTime:new Date(body.startTime), endTime:body.endTime?new Date(body.endTime):null,
      startBattery:body.startBattery, endBattery:body.endBattery??null,
      kwhDelivered:body.kwhDelivered??null, stationId:body.stationId,
      cost:body.cost??null, notes:body.notes??null,
    },
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, operator:{ select:{ name:true, email:true } } },
  })
  return NextResponse.json(log, { status:201 })
}
