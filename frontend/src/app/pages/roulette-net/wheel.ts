export function buildWheel(): void {
    
    const wheel = document.querySelector('.wheel');
    if (!wheel) return;

    const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27,
    13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
    20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];

    numbers.forEach((num, index) => {
    const a = index + 1;
    const spanClass = num < 10 ? 'single' : 'double';

    const sect = document.createElement('div');
    sect.id = 'sect' + a;
    sect.className = 'sect';

    const span = document.createElement('span');
    span.className = spanClass;
    span.innerText = num.toString();
    sect.appendChild(span);

    const block = document.createElement('div');
    block.className = 'block';
    sect.appendChild(block);

    wheel.appendChild(sect);
    });
}
