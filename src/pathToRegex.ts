const pathToRegExp = (path: string): string => {
    const parts = path.split('/');

    const regexParts = parts.map((part) => {
        if (part.startsWith(':')) {
            const groupName = part.slice(1);

            return `(?<${groupName}>\\d+)`;
        }
        return part;
    });

    const regexToMatchPath = regexParts.join('\\/');

    return `^${regexToMatchPath}$`;
};

export { pathToRegExp };
