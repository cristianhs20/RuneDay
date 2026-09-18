import type { GuildHall } from '@/types/guild';

export function GuildHallVisual({
    hall,
    className = '',
}: {
    hall: GuildHall;
    className?: string;
}) {
    const tower = hall.level >= 4;
    const castle = hall.level >= 5;
    const tavern = hall.level >= 2;
    const properHall = hall.level >= 3;

    return (
        <svg
            viewBox="0 0 160 110"
            role="img"
            aria-label={hall.name}
            className={className}
            shapeRendering="crispEdges"
        >
            <rect x="0" y="90" width="160" height="20" fill="#252a31" />
            <rect x="13" y="84" width="134" height="7" fill="#3a424d" />

            {hall.level === 1 ? (
                <>
                    <polygon points="35,70 80,28 125,70" fill="#6d4a34" />
                    <polygon points="49,70 80,40 111,70" fill="#a56e42" />
                    <rect x="73" y="57" width="14" height="27" fill="#342923" />
                    <rect x="25" y="80" width="25" height="5" fill="#5e4a38" />
                    <rect x="110" y="80" width="25" height="5" fill="#5e4a38" />
                </>
            ) : (
                <>
                    <rect x="40" y="44" width="80" height="40" fill="#59616b" />
                    <rect x="48" y="54" width="64" height="30" fill="#6d7782" />
                    <polygon points="34,46 80,18 126,46" fill="#4b342f" />
                    <rect x="72" y="63" width="16" height="21" fill="#322d2b" />
                    <rect x="54" y="61" width="10" height="9" fill="#a6c8d8" />
                    <rect x="96" y="61" width="10" height="9" fill="#a6c8d8" />
                    {tavern && (
                        <>
                            <rect
                                x="117"
                                y="53"
                                width="18"
                                height="6"
                                fill="#8b633b"
                            />
                            <rect
                                x="124"
                                y="59"
                                width="4"
                                height="16"
                                fill="#5b4937"
                            />
                        </>
                    )}
                    {properHall && (
                        <>
                            <rect
                                x="67"
                                y="34"
                                width="26"
                                height="10"
                                fill="#454d57"
                            />
                            <rect
                                x="73"
                                y="26"
                                width="14"
                                height="10"
                                fill="#56616d"
                            />
                        </>
                    )}
                    {tower && (
                        <>
                            <rect
                                x="24"
                                y="36"
                                width="24"
                                height="48"
                                fill="#515963"
                            />
                            <rect
                                x="112"
                                y="36"
                                width="24"
                                height="48"
                                fill="#515963"
                            />
                            <polygon
                                points="20,36 36,17 52,36"
                                fill="#3e454d"
                            />
                            <polygon
                                points="108,36 124,17 140,36"
                                fill="#3e454d"
                            />
                        </>
                    )}
                    {castle && (
                        <>
                            <rect
                                x="69"
                                y="10"
                                width="22"
                                height="18"
                                fill="#515963"
                            />
                            <rect
                                x="66"
                                y="7"
                                width="7"
                                height="8"
                                fill="#515963"
                            />
                            <rect
                                x="77"
                                y="7"
                                width="7"
                                height="8"
                                fill="#515963"
                            />
                            <rect
                                x="88"
                                y="7"
                                width="7"
                                height="8"
                                fill="#515963"
                            />
                            <rect
                                x="78"
                                y="0"
                                width="3"
                                height="11"
                                fill="#b08b4d"
                            />
                            <polygon points="81,0 94,4 81,8" fill="#8f3340" />
                        </>
                    )}
                </>
            )}
        </svg>
    );
}
