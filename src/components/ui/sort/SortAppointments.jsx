'use client';
import capitalize from '@/utils/capitalize.mjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

const SortAppointments = ({ sort, filter, limit }) => {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const [selectedSort, setSelectedSort] = useState({ value: sort, label: sort === 'newest' ? 'Newest' : 'Oldest' });
    const [selectedFilter, setSelectedFilter] = useState({ value: filter, label: capitalize(filter) || 'All' });
    const [selectedLimit, setSelectedLimit] = useState({ value: limit, label: `${limit} items per page` });

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
    ];
    const limitOptions = [
        { value: 10, label: '10 items per page' },
        { value: 20, label: '20 items per page' },
        { value: 50, label: '50 items per page' },
        { value: 100, label: '100 items per page' },
    ];
    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'with_advance_payment', label: 'With Payment' },
        { value: 'without_advance_payment', label: 'Without Payment' },
        { value: 'finished', label: 'Expired' },
    ];

    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('limit', selectedLimit.value);
            query.set('sort', selectedSort.value);
            query.set('filter', selectedFilter.value);
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true);
        }
    }, [selectedSort, selectedLimit, selectedFilter]);

    return (
        <div className='flex flex-wrap items-center justify-center pt-4 z-0 text-black gap-2 bg-gray-100 dark:bg-gray-900'>
            <Select
                value={selectedSort}
                onChange={setSelectedSort}
                options={sortOptions}
                className="w-40"
                instanceId={'select-sort-appointments'}
            />
            <Select
                value={selectedFilter}
                onChange={setSelectedFilter}
                options={filterOptions}
                className="w-40"
                instanceId={'select-filter-appointments'}
            />
            <Select
                value={selectedLimit}
                onChange={setSelectedLimit}
                options={limitOptions}
                className="w-40"
                instanceId={'select-limit-appointments'}
            />
        </div>
    );
};

export default SortAppointments;
