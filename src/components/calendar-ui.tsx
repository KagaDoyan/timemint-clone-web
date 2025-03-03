
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    parseISO,
    startOfToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, EllipsisVertical } from 'lucide-react'
import { Fragment, useState } from 'react'

const meetings = [
    {
        id: 1,
        name: 'Leslie Alexander',
        imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        startDatetime: '2022-05-11T13:00',
        endDatetime: '2022-05-11T14:30',
    },
    {
        id: 2,
        name: 'Michael Foster',
        imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        startDatetime: '2022-05-20T09:00',
        endDatetime: '2022-05-20T11:30',
    },
    {
        id: 3,
        name: 'Dries Vincent',
        imageUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        startDatetime: '2022-05-20T17:00',
        endDatetime: '2022-05-20T18:30',
    },
    {
        id: 4,
        name: 'Leslie Alexander',
        imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        startDatetime: '2022-06-09T13:00',
        endDatetime: '2022-06-09T14:30',
    },
    {
        id: 5,
        name: 'Michael Foster',
        imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        startDatetime: '2022-05-13T14:00',
        endDatetime: '2022-05-13T14:30',
    },
]

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

interface CalendarProps {
    date: Date
    setSelectedDay: (date: Date) => void
}

export default function CalendarUI({ date, setSelectedDay }: CalendarProps) {
    let today = startOfToday()
    let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
    let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())

    let days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    })

    function previousMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }

    function nextMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }

    let selectedDayMeetings = meetings.filter((meeting) =>
        isSameDay(parseISO(meeting.startDatetime), date)
    )

    return (
        <div className="w-full p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center">
                <h2 className="flex-auto font-semibold text-gray-900">
                    {format(firstDayCurrentMonth, 'MMMM yyyy')}
                </h2>
                <button
                    type="button"
                    onClick={previousMonth}
                    className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                    <span className="sr-only">Previous month</span>
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                    onClick={nextMonth}
                    type="button"
                    className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                    <span className="sr-only">Next month</span>
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500 border-b border-gray-200 p-2">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
                {days?.map((day, dayIdx) => (
                    <div
                        key={day.toString()}
                        className={classNames(
                            dayIdx === 0 && colStartClasses[getDay(day)],
                            'py-1.5'
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={classNames(
                                isEqual(day, date) && 'text-white',
                                !isEqual(day, date) &&
                                isToday(day) &&
                                'text-red-500',
                                !isEqual(day, date) &&
                                !isToday(day) &&
                                isSameMonth(day, firstDayCurrentMonth) &&
                                'text-gray-900',
                                !isEqual(day, date) &&
                                !isToday(day) &&
                                !isSameMonth(day, firstDayCurrentMonth) &&
                                'text-gray-400',
                                isEqual(day, date) && isToday(day) && 'bg-red-500',
                                isEqual(day, date) &&
                                !isToday(day) &&
                                'bg-gray-900',
                                !isEqual(day, date) && 'hover:bg-gray-200',
                                (isEqual(day, date) || isToday(day)) &&
                                'font-semibold',
                                'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                            )}
                        >
                            <time dateTime={format(day, 'yyyy-MM-dd')}>
                                {format(day, 'd')}
                            </time>
                        </button>

                        <div className="w-1 h-1 mx-auto mt-1">
                            {meetings.some((meeting) =>
                                isSameDay(parseISO(meeting.startDatetime), day)
                            ) && (
                                    <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// function Meeting({ meeting }) {
//   let startDateTime = parseISO(meeting.startDatetime)
//   let endDateTime = parseISO(meeting.endDatetime)

//   return (
//     <li className="flex items-center px-4 py-2 space-x-4 group rounded-xl focus-within:bg-gray-100 hover:bg-gray-100">
//       <img
//         src={meeting.imageUrl}
//         alt=""
//         className="flex-none w-10 h-10 rounded-full"
//       />
//       <div className="flex-auto">
//         <p className="text-gray-900">{meeting.name}</p>
//         <p className="mt-0.5">
//           <time dateTime={meeting.startDatetime}>
//             {format(startDateTime, 'h:mm a')}
//           </time>{' '}
//           -{' '}
//           <time dateTime={meeting.endDatetime}>
//             {format(endDateTime, 'h:mm a')}
//           </time>
//         </p>
//       </div>
//     </li>
//   )
// }

let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7',
]
