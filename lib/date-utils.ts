export function formatDate(date: Date | string, pattern: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const year = d.getFullYear();
  const monthIdx = d.getMonth();
  const day = d.getDate();

  const pad = (num: number) => String(num).padStart(2, "0");

  if (pattern === "MMM dd, yyyy") {
    return `${monthsShort[monthIdx]} ${pad(day)}, ${year}`;
  }
  if (pattern === "MMMM dd, yyyy") {
    return `${monthsFull[monthIdx]} ${pad(day)}, ${year}`;
  }
  if (pattern === "MM/dd") {
    return `${pad(monthIdx + 1)}/${pad(day)}`;
  }
  if (pattern === "MMM dd") {
    return `${monthsShort[monthIdx]} ${pad(day)}`;
  }
  if (pattern === "yyyy") {
    return String(year);
  }
  
  return d.toLocaleDateString();
}

export function isAfterDate(dateA: Date | string, dateB: Date | string): boolean {
  const dA = new Date(dateA);
  const dB = new Date(dateB);
  
  // Compare by midnight to ignore time parts
  const dAOnly = new Date(dA.getFullYear(), dA.getMonth(), dA.getDate());
  const dBOnly = new Date(dB.getFullYear(), dB.getMonth(), dB.getDate());
  
  return dAOnly.getTime() > dBOnly.getTime();
}

export function isTodayDate(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}
