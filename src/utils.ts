function frenchDayFormatFromDate(date: Date): string {
  const mois: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout',
    'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  const year = date.getFullYear();
  const dayNumber = date.getDate();
  const month = mois[date.getMonth()];
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' });

  return `${weekday} ${dayNumber} ${month} ${year}`;
}

function frenchFormatFromDate(date: Date): string {
  const day = frenchDayFormatFromDate(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} - ${hours}h${minutes}`;
}

function setMeta(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export { frenchDayFormatFromDate, frenchFormatFromDate, setMeta };
