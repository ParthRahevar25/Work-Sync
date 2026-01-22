import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    api.get("/employee").then(res => setEmployees(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Employees</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id} className="border-t">
              <td>{emp.name}</td>
              <td>{emp.department}</td>
              <td>{emp.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
