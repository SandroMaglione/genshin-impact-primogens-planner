import { useEvents } from "../lib/hooks/use-events";
import Fate from "./fate";
import Primogem from "./primogem";

export default function ListEvents() {
  const { data, error, loading } = useEvents();

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.reason}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th className="text-left">Date</th>
          <th>
            <Primogem className="size-8" />
          </th>
          <th>
            <Fate className="size-8" />
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((event) => (
          <tr key={event.eventId}>
            <td>
              <p>{event.name}</p>
              <p>
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </p>
              <p>
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </td>
            <td>{event.primogems}</td>
            <td>{event.fates}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
