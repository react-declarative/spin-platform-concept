export const labels = [
    ...[...new Array(10)]
        .map((_, idx) => `spinned <bgcolor-red>${idx + 1} CHIPS</bgcolor-red> and got rugged`),
    ...[...new Array(10)]
        .map((_, idx) => `spinned <bgcolor-green>${idx + 1} CHIPS</bgcolor-green> and got doubled`),
    ...[...new Array(5)]
        .map((_, idx) => `<underline-green>spinned ${idx + 10} CHIPS and got doubled</underline-green>`),
    ...[...new Array(5)]
        .map((_, idx) => `<underline-red>spinned ${idx + 10} CHIPS and got rugged</underline-red>`),
];
