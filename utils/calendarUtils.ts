
export function generateGoogleCalendarLink(title: string, dateStr: string, description: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '#';
  
  const startTime = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTime = new Date(date.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', `DEADLINE: ${title}`);
  url.searchParams.append('dates', `${startTime}/${endTime}`);
  url.searchParams.append('details', description);
  url.searchParams.append('sf', 'true');
  url.searchParams.append('output', 'xml');
  
  return url.toString();
}

export function downloadICS(title: string, dateStr: string, description: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return;

  const startTime = date.toISOString().replace(/-|:|\.\d\d\d/g, "").split('.')[0] + "Z";
  const endTime = new Date(date.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "").split('.')[0] + "Z";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
    `SUMMARY:DEADLINE: ${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `deadline-${title.replace(/\s+/g, '-').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
