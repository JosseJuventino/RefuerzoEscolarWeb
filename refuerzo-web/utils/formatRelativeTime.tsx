export const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
  
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return rtf.format(-interval, unit as Intl.RelativeTimeFormatUnit);
      }
    }
    
    return "Justo ahora";
  };