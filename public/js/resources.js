// Filter pills
const pills = document.querySelectorAll('.filter-pill');
const sections = document.querySelectorAll('section[data-section]');
const cards = document.querySelectorAll('.resource-card[data-category]');

pills.forEach(pill => {
    pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;

        if (filter === 'all') {
            sections.forEach(s => s.style.display = '');
            cards.forEach(c => c.style.display = '');
        } else {
            sections.forEach(section => {
                const sectionFilter = section.dataset.section;
                section.style.display = sectionFilter === filter ? '' : 'none';
            });
            cards.forEach(card => {
                card.style.display = card.dataset.category === filter ? '' : 'none';
            });
        }
    });
});