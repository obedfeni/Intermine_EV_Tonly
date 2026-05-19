import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const faults = await prisma.fault.findMany({
    include:{
      truck:{ select:{ truckId:true, model:true, licensePlate:true } },
      reporter:{ select:{ name:true, email:true } },
    },
    orderBy:{ createdAt:'desc' },
  })
  return NextResponse.json(faults)
}
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const role = (session.user as any).role
  if (!['TECHNICIAN','SUPERVISOR'].includes(role)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const body = await req.json()
  const fault = await prisma.fault.create({
    data:{ title:body.title, description:body.description, severity:body.severity, truckId:body.truckId, reportedBy:session.user.id! },
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, reporter:{ select:{ name:true, email:true } } },
  })
  if (['HIGH','CRITICAL'].includes(body.severity)) {
    await prisma.truck.update({ where:{ id:body.truckId }, data:{ status:'FAULTY' } })
  }
  return NextResponse.json(fault, { status:201 })
}
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id, ...data } = await req.json()
  const fault = await prisma.fault.update({
    where:{ id }, data,
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, reporter:{ select:{ name:true, email:true } } },
  })
  return NextResponse.json(fault)
}
