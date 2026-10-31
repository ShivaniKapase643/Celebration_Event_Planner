export function calculateDeadlineOffset(eventDate: string): string {
  const event = new Date(eventDate);
  const now = new Date();
  const diffDays = Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? 'Due now' : `T-${diffDays} days`;
}

export function createTaskDeadlines(eventDate: string): Array<{ title: string; deadline: string }> {
  const event = new Date(eventDate);
  const baseline = new Date(event);
  const tasks = [
    { title: 'Confirm venue', days: 30 },
    { title: 'Book caterer', days: 24 },
    { title: 'Finalize decor', days: 18 },
    { title: 'Send invites', days: 12 },
    { title: 'Final checklist', days: 3 }
  ];

  return tasks.map((task) => {
    const due = new Date(baseline);
    due.setDate(baseline.getDate() - task.days);
    return {
      title: task.title,
      deadline: `T-${task.days} days`
    };
  });
}
