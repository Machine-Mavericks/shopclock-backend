import { time } from "node:console";

interface Employee {
  id: string;
  name: string;
  code: string;
}

interface Punch {
  employeeId: string;
  type: "IN" | "OUT";
  time: Date;
}

const employees: Employee[] = [
  {
    id: "1",
    name: "Liam",
    code: "1234"
  }
];

const punches: Punch[] = [];

export async function handlePunch(code: string) {
  const employee = employees.find(employee => employee.code === code);

  if(!employee) {
    return null;
  }

  const lastPunch = punches.filter(punch => punch.employeeId === employee.id).at(-1);

  const type: Punch["type"] = lastPunch?.type === "IN" ? "OUT" : "IN";

  const punch: Punch = {
    employeeId: employee.id,
    type,
    time: new Date()
  };

  punches.push(punch);

  return {
    employee: {
      id: employee.id,
      name: employee.name
    },
    type: punch.type,
    time: punch.time
  }
}

