import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const trucks = await prisma.truck.findMany({
    include:{ _count:{ select:{ faults:true, tasks:true, chargingLogs:true } } },
    orderBy:{ truckId:'asc' },
  })
  return NextResponse.json(trucks)
}
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  if ((session.user as any).role !== 'SUPERVISOR') return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const { id, ...data } = await req.json()
  const truck = await prisma.truck.update({ where:{ id }, data })
  return NextResponse.json(truck)
}
