import { PlusCircle } from "lucide-react";

export default function DataTableDemo() {
  return (
    <>
      <div className="relative w-full flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead>
              <tr className="border border-solid">
                <th className="text-md px-4 py-2"></th>
                <th className="text-md px-4 py-2">First Name</th>
                <th className="text-md px-4 py-2">Last Name</th>
                <th className="text-md px-4 py-2">Age</th>
                <th className="text-md px-4 py-2">Email</th>
                <th className="text-md px-4 py-2">Department</th>
                <th className="text-md px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-md px-4 py-2">
                  <input type="checkbox" className="absolute top-6 left-6" />
                  <PlusCircle className="h-6 w-6 xl:hidden" />
                </td>
                <td className="text-md px-4 py-2">John</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">30</td>
                <td className="text-md px-4 py-2">panoudeth@gmail.com</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">edit</td>
              </tr>
              <tr>
                <td>
                  <PlusCircle className="h-6 w-6 xl:hidden" /></td>
                <td className="text-md px-4 py-2">John</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">30</td>
                <td className="text-md px-4 py-2">panoudeth@gmail.com</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">edit</td>
              </tr>
              <tr>
                <td><PlusCircle className="h-6 w-6 xl:hidden" /></td>
                <td className="text-md px-4 py-2">John</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">30</td>
                <td className="text-md px-4 py-2">panoudeth@gmail.com</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">edit</td>
              </tr>
              <tr>
                <td><PlusCircle className="h-6 w-6 xl:hidden" /></td>
                <td className="text-md px-4 py-2">John</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">30</td>
                <td className="text-md px-4 py-2">panoudeth@gmail.com</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">edit</td>
              </tr>
              <tr>
                <td><PlusCircle className="h-6 w-6 xl:hidden" /></td>
                <td className="text-md px-4 py-2">John</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">30</td>
                <td className="text-md px-4 py-2">panoudeth@gmail.com</td>
                <td className="text-md px-4 py-2">Doe</td>
                <td className="text-md px-4 py-2">edit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}