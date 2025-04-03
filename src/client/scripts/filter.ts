function setFilterChangeListener() {
    const filterButtons = document.querySelectorAll('#filter-buttons button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.dispatchEvent(new CustomEvent('filterChange', {
                detail: {
                    sort: button.id
                }
            }));
        });
    });
}

export { setFilterChangeListener }