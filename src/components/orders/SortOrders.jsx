'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from 'react-select';

const SortOrders = ({ filter }) => {
    const [selectedFilter, setSelectedFilter] = useState(filter);
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);
    const theme = useSelector((state) => state.theme.mode);
    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('filter', selectedFilter);
            router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
        } else {
            setHasMounted(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilter]);

    // Handle filter change (React Select)
    const handleFilterChange = (selectedOption) => {
        setSelectedFilter(selectedOption.value);
    };
    const customStyles = (theme = 'light') => ({
        control: (provided) => ({
            ...provided,
            backgroundColor: theme === "dark" ? '#384152' : '#fff', // Dark or light background
            color: theme === "dark" ? '#fff' : '#333', // Text color
            borderColor: theme === "dark" ? '#555' : '#ccc', // Border color
            boxShadow: theme === "dark" ? '0 0 0 1px #555' : '0 0 0 1px #ccc', // Border focus shadow
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? theme === "dark"
                    ? '#444'
                    : '#ddd'
                : state.isFocused
                    ? theme === "dark"
                        ? '#555'
                        : '#f2f2f2'
                    : theme === "dark"
                        ? '#2D2D2D'
                        : '#fff', // Option background colors based on dark or light theme
            color: theme === "dark" ? '#fff' : '#333', // Option text color
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === "dark" ? '#fff' : '#333', // Text color for the selected value
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === "dark" ? '#384152' : '#fff', // Dropdown menu background color
        }),
    });
    // React Select options for the filter
    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'pending_only', label: 'Pending Only' },
        { value: 'approved_only', label: 'Approved Only' },
    ];

    return (
        <div className="w-fit">
            <Select
                options={filterOptions}
                styles={customStyles(theme)}
                instanceId={'select-sort-orders'}
                value={filterOptions.find(option => option.value === selectedFilter)} // Set the current selected filter
                onChange={handleFilterChange}
                className="w-44"
                placeholder="Select Filter"
            />
        </div>
    );
};

export default SortOrders;
