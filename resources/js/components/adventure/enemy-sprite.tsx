export function EnemySprite({
    visualKey,
    className = '',
}: {
    visualKey: string;
    className?: string;
}) {
    const isBoss =
        visualKey.includes('warden') ||
        visualKey.includes('tyrant') ||
        visualKey.includes('colossus');

    return (
        <svg
            viewBox="0 0 64 64"
            role="img"
            aria-label="Adventure enemy"
            className={className}
            shapeRendering="crispEdges"
        >
            <ellipse
                cx="32"
                cy="58"
                rx={isBoss ? 18 : 14}
                ry="3"
                fill="currentColor"
                opacity="0.12"
            />
            <EnemyBody visualKey={visualKey} />
        </svg>
    );
}

function EnemyBody({ visualKey }: { visualKey: string }) {
    if (visualKey.includes('mossling')) {
        return (
            <>
                <rect x="20" y="27" width="24" height="23" fill="#4f7951" />
                <rect x="24" y="20" width="16" height="9" fill="#5b8f5d" />
                <rect x="19" y="18" width="7" height="7" fill="#6ca96b" />
                <rect x="38" y="17" width="7" height="8" fill="#6ca96b" />
                <rect x="25" y="32" width="4" height="4" fill="#f0d46e" />
                <rect x="35" y="32" width="4" height="4" fill="#f0d46e" />
                <rect x="22" y="49" width="7" height="7" fill="#37563a" />
                <rect x="35" y="49" width="7" height="7" fill="#37563a" />
            </>
        );
    }

    if (visualKey.includes('thorn_wolf')) {
        return (
            <>
                <rect x="15" y="31" width="31" height="14" fill="#53624b" />
                <rect x="39" y="24" width="13" height="13" fill="#66795a" />
                <rect x="41" y="19" width="4" height="7" fill="#3f4c39" />
                <rect x="48" y="18" width="4" height="8" fill="#3f4c39" />
                <rect x="44" y="29" width="3" height="3" fill="#e5b95e" />
                <rect x="16" y="25" width="4" height="8" fill="#78936b" />
                <rect x="24" y="24" width="4" height="8" fill="#78936b" />
                <rect x="33" y="23" width="4" height="9" fill="#78936b" />
                <rect x="18" y="44" width="5" height="10" fill="#394438" />
                <rect x="37" y="44" width="5" height="10" fill="#394438" />
            </>
        );
    }

    if (visualKey.includes('root_warden')) {
        return (
            <>
                <rect x="16" y="18" width="32" height="34" fill="#5a4630" />
                <rect x="21" y="12" width="22" height="12" fill="#6f573b" />
                <rect x="10" y="24" width="8" height="22" fill="#4a3928" />
                <rect x="46" y="24" width="8" height="22" fill="#4a3928" />
                <rect x="23" y="29" width="5" height="5" fill="#86c57c" />
                <rect x="36" y="29" width="5" height="5" fill="#86c57c" />
                <rect x="25" y="52" width="6" height="7" fill="#3c2e23" />
                <rect x="35" y="52" width="6" height="7" fill="#3c2e23" />
                <rect x="12" y="14" width="5" height="12" fill="#6a8751" />
                <rect x="48" y="12" width="5" height="14" fill="#6a8751" />
            </>
        );
    }

    if (visualKey.includes('ash_crawler')) {
        return (
            <>
                <rect x="15" y="34" width="34" height="11" fill="#4d4643" />
                <rect x="22" y="28" width="20" height="9" fill="#5c514d" />
                <rect x="26" y="31" width="3" height="3" fill="#ff8d44" />
                <rect x="36" y="31" width="3" height="3" fill="#ff8d44" />
                <rect x="13" y="44" width="5" height="8" fill="#332f2d" />
                <rect x="23" y="44" width="5" height="8" fill="#332f2d" />
                <rect x="36" y="44" width="5" height="8" fill="#332f2d" />
                <rect x="46" y="44" width="5" height="8" fill="#332f2d" />
            </>
        );
    }

    if (visualKey.includes('cinder_hound')) {
        return (
            <>
                <rect x="14" y="31" width="32" height="14" fill="#6b4033" />
                <rect x="39" y="23" width="13" height="13" fill="#7b4939" />
                <rect x="44" y="28" width="3" height="3" fill="#ffb04e" />
                <rect x="16" y="27" width="4" height="5" fill="#d86a3b" />
                <rect x="22" y="24" width="4" height="8" fill="#d86a3b" />
                <rect x="29" y="22" width="4" height="10" fill="#d86a3b" />
                <rect x="18" y="44" width="5" height="10" fill="#3e2b27" />
                <rect x="37" y="44" width="5" height="10" fill="#3e2b27" />
            </>
        );
    }

    if (visualKey.includes('forge_tyrant')) {
        return (
            <>
                <rect x="14" y="17" width="36" height="35" fill="#5b4d49" />
                <rect x="21" y="10" width="22" height="11" fill="#6b5b55" />
                <rect x="8" y="23" width="8" height="24" fill="#4a3c39" />
                <rect x="48" y="23" width="8" height="24" fill="#4a3c39" />
                <rect x="23" y="27" width="5" height="5" fill="#ff8c45" />
                <rect x="36" y="27" width="5" height="5" fill="#ff8c45" />
                <rect x="28" y="38" width="8" height="7" fill="#f2a14e" />
                <rect x="22" y="52" width="8" height="7" fill="#3b302e" />
                <rect x="35" y="52" width="8" height="7" fill="#3b302e" />
            </>
        );
    }

    if (visualKey.includes('wisp_knight')) {
        return (
            <>
                <rect x="22" y="16" width="20" height="14" fill="#66717f" />
                <rect x="19" y="29" width="26" height="22" fill="#596471" />
                <rect x="26" y="21" width="4" height="3" fill="#9fe5ef" />
                <rect x="35" y="21" width="4" height="3" fill="#9fe5ef" />
                <rect x="13" y="31" width="7" height="18" fill="#4a555f" />
                <rect x="44" y="31" width="7" height="18" fill="#4a555f" />
                <rect x="23" y="51" width="7" height="7" fill="#48515b" />
                <rect x="35" y="51" width="7" height="7" fill="#48515b" />
            </>
        );
    }

    if (visualKey.includes('void_scholar')) {
        return (
            <>
                <rect x="22" y="14" width="20" height="14" fill="#4a4461" />
                <rect x="18" y="27" width="28" height="27" fill="#3d3854" />
                <rect x="25" y="20" width="4" height="3" fill="#ba9cff" />
                <rect x="35" y="20" width="4" height="3" fill="#ba9cff" />
                <rect x="10" y="31" width="7" height="18" fill="#5b4f79" />
                <rect x="49" y="28" width="3" height="24" fill="#8f78c8" />
                <rect x="46" y="26" width="9" height="4" fill="#b09be8" />
            </>
        );
    }

    return (
        <>
            <rect x="12" y="13" width="40" height="40" fill="#51516a" />
            <rect x="19" y="7" width="26" height="11" fill="#656580" />
            <rect x="5" y="22" width="9" height="26" fill="#43435c" />
            <rect x="50" y="22" width="9" height="26" fill="#43435c" />
            <rect x="22" y="26" width="6" height="5" fill="#a8d6ff" />
            <rect x="36" y="26" width="6" height="5" fill="#a8d6ff" />
            <rect x="27" y="37" width="10" height="8" fill="#7d6aa3" />
            <rect x="20" y="53" width="9" height="7" fill="#3b3b50" />
            <rect x="35" y="53" width="9" height="7" fill="#3b3b50" />
        </>
    );
}
