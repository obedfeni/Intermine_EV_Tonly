import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const tasks = await prisma.task.findMany({
    include:{
      truck:{ select:{ truckId:true, model:true, licensePlate:true } },
      assignee:{ select:{ name:true, email:true } },
      creator:{ select:{ name:true, email:true } },
    },
    orderBy:{ createdAt:'desc' },
  })
  return NextResponse.json(tasks)
}
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  if ((session.user as any).role !== 'SUPERVISOR') return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const body = await req.json()
  const task = await prisma.task.create({
    data:{
      title:body.title, description:body.description, priority:body.priority,
      truckId:body.truckId, assignedTo:body.assignedTo||null,
      scheduledAt:body.scheduledAt?new Date(body.scheduledAt):null,
      notes:body.notes||null, createdBy:session.user.id!,
      status:body.assignedTo?'ASSIGNED':'PENDING',
    },
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, assignee:{ select:{ name:true, email:true } }, creator:{ select:{ name:true, email:true } } },
  })
  return NextResponse.json(task, { status:201 })
}
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id, ...data } = await req.json()
  if (data.status === 'COMPLETED') data.completedAt = new Date()
  const task = await prisma.task.update({
    where:{ id }, data,
    include:{ truck:{ select:{ truckId:true, model:true, licensePlate:true } }, assignee:{ select:{ name:true, email:true } }, creator:{ select:{ name:true, email:true } } },
  })
  return NextResponse.json(task)
}
