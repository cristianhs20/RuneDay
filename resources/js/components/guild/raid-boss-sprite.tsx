export function RaidBossSprite({
    visualKey,
    className = '',
}: {
    visualKey: string;
    className?: string;
}) {
    const isAsh = visualKey.includes('ashen');
    const isMoon = visualKey.includes('moon');

    const body = isMoon ? '#4e476b' : isAsh ? '#64423a' : '#4c654b';
    const accent = isMoon ? '#b49cff' : isAsh ? '#f18a4e' : '#83b874';

    return (
        <svg
            viewBox="0 0 80 80"
            role="img"
            aria-label="Guild raid boss"
            className={className}
            shapeRendering="crispEdges"
        >
            <ellipse
                cx="40"
                cy="72"
                rx="27"
                ry="4"
                fill="currentColor"
                opacity="0.12"
            />
            <rect x="17" y="22" width="46" height="43" fill={body} />
            <rect x="25" y="13" width="30" height="16" fill={body} />
            <rect x="8" y="31" width="12" height="27" fill={body} />
            <rect x="60" y="31" width="12" height="27" fill={body} />
            <rect x="27" y="31" width="7" height="6" fill={accent} />
            <rect x="46" y="31" width="7" height="6" fill={accent} />
            <rect
                x="33"
                y="48"
                width="14"
                height="9"
                fill={accent}
                opacity="0.8"
            />
            <rect x="22" y="64" width="13" height="8" fill="#31343b" />
            <rect x="45" y="64" width="13" height="8" fill="#31343b" />
            {isMoon && (
                <>
                    <rect x="14" y="17" width="7" height="14" fill="#65598a" />
                    <rect x="59" y="17" width="7" height="14" fill="#65598a" />
                </>
            )}
            {isAsh && (
                <>
                    <rect x="20" y="12" width="6" height="11" fill="#d6643d" />
                    <rect x="54" y="11" width="6" height="12" fill="#d6643d" />
                </>
            )}
        </svg>
    );
}
