import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
const trucks = [
  {truckId:'TNL-001',model:'Tonly EV-Max 300',year:2022,licensePlate:'GR-1001-23',vin:'VIN10000000000001',batteryCapacity:282,status:'ACTIVE',mileage:45200,location:'Bay A'},
  {truckId:'TNL-002',model:'Tonly EV-Max 300',year:2022,licensePlate:'GR-1002-23',vin:'VIN10000000000002',batteryCapacity:282,status:'ACTIVE',mileage:38900,location:'Bay A'},
  {truckId:'TNL-003',model:'Tonly EV-Pro 400',year:2023,licensePlate:'GR-1003-23',vin:'VIN10000000000003',batteryCapacity:350,status:'CHARGING',mileage:22100,location:'Charging Station 1'},
  {truckId:'TNL-004',model:'Tonly EV-Pro 400',year:2023,licensePlate:'GR-1004-23',vin:'VIN10000000000004',batteryCapacity:350,status:'ACTIVE',mileage:19800,location:'Bay B'},
  {truckId:'TNL-005',model:'Tonly EV-Max 300',year:2022,licensePlate:'GR-1005-23',vin:'VIN10000000000005',batteryCapacity:282,status:'MAINTENANCE',mileage:61000,location:'Workshop'},
  {truckId:'TNL-006',model:'Tonly EV-Ultra 500',year:2023,licensePlate:'GR-1006-23',vin:'VIN10000000000006',batteryCapacity:420,status:'ACTIVE',mileage:12400,location:'Bay C'},
  {truckId:'TNL-007',model:'Tonly EV-Ultra 500',year:2023,licensePlate:'GR-1007-23',vin:'VIN10000000000007',batteryCapacity:420,status:'ACTIVE',mileage:14700,location:'Bay C'},
  {truckId:'TNL-008',model:'Tonly EV-Pro 400',year:2022,licensePlate:'GR-1008-22',vin:'VIN10000000000008',batteryCapacity:350,status:'FAULTY',mileage:53200,location:'Workshop'},
  {truckId:'TNL-009',model:'Tonly EV-Max 300',year:2023,licensePlate:'GR-1009-23',vin:'VIN10000000000009',batteryCapacity:282,status:'ACTIVE',mileage:8900,location:'Bay A'},
  {truckId:'TNL-010',model:'Tonly EV-Max 300',year:2023,licensePlate:'GR-1010-23',vin:'VIN10000000000010',batteryCapacity:282,status:'CHARGING',mileage:16500,location:'Charging Station 2'},
  {truckId:'TNL-011',model:'Tonly EV-Pro 400',year:2023,licensePlate:'GR-1011-23',vin:'VIN10000000000011',batteryCapacity:350,status:'ACTIVE',mileage:25300,location:'Bay B'},
  {truckId:'TNL-012',model:'Tonly EV-Ultra 500',year:2024,licensePlate:'GR-1012-24',vin:'VIN10000000000012',batteryCapacity:420,status:'ACTIVE',mileage:5100,location:'Bay D'},
  {truckId:'TNL-013',model:'Tonly EV-Ultra 500',year:2024,licensePlate:'GR-1013-24',vin:'VIN10000000000013',batteryCapacity:420,status:'ACTIVE',mileage:4800,location:'Bay D'},
  {truckId:'TNL-014',model:'Tonly EV-Max 300',year:2022,licensePlate:'GR-1014-22',vin:'VIN10000000000014',batteryCapacity:282,status:'IDLE',mileage:72100,location:'Bay E'},
  {truckId:'TNL-015',model:'Tonly EV-Pro 400',year:2023,licensePlate:'GR-1015-23',vin:'VIN10000000000015',batteryCapacity:350,status:'ACTIVE',mileage:31700,location:'Bay B'},
  {truckId:'TNL-016',model:'Tonly EV-Pro 400',year:2023,licensePlate:'GR-1016-23',vin:'VIN10000000000016',batteryCapacity:350,status:'MAINTENANCE',mileage:44800,location:'Workshop'},
  {truckId:'TNL-017',model:'Tonly EV-Max 300',year:2024,licensePlate:'GR-1017-24',vin:'VIN10000000000017',batteryCapacity:282,status:'ACTIVE',mileage:3200,location:'Bay A'},
  {truckId:'TNL-018',model:'Tonly EV-Ultra 500',year:2024,licensePlate:'GR-1018-24',vin:'VIN10000000000018',batteryCapacity:420,status:'ACTIVE',mileage:6700,location:'Bay D'},
  {truckId:'TNL-019',model:'Tonly EV-Pro 400',year:2022,licensePlate:'GR-1019-22',vin:'VIN10000000000019',batteryCapacity:350,status:'ACTIVE',mileage:58400,location:'Bay C'},
  {truckId:'TNL-020',model:'Tonly EV-Max 300',year:2024,licensePlate:'GR-1020-24',vin:'VIN10000000000020',batteryCapacity:282,status:'ACTIVE',mileage:2100,location:'Bay A'},
]
async function main() {
  for (const t of trucks) {
    await prisma.truck.upsert({ where:{truckId:t.truckId}, update:{}, create:{...t,status:t.status as any,lastService:new Date(Date.now()-Math.random()*90*864e5),nextService:new Date(Date.now()+Math.random()*90*864e5)} })
  }
  const users = [
    {name:'Admin Supervisor',email:'supervisor@tonly.com',password:'password123',role:'SUPERVISOR'},
    {name:'John Technician',email:'tech@tonly.com',password:'password123',role:'TECHNICIAN'},
    {name:'Mary Worker',email:'worker@tonly.com',password:'password123',role:'WORKER'},
    {name:'Sam Charger',email:'charger@tonly.com',password:'password123',role:'CHARGING_OPERATOR'},
  ]
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12)
    await prisma.user.upsert({ where:{email:u.email}, update:{}, create:{name:u.name,email:u.email,password:hashed,role:u.role as any} })
  }
  console.log('Seeded 20 trucks and 4 demo users')
}
main().catch(console.error).finally(()=>prisma.$disconnect())
