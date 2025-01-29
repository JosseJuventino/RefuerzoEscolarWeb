export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    return new Intl.DateTimeFormat('es-ES', options).format(date);
};