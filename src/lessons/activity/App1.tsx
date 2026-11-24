import { Activity, useState } from 'react';

const FilterGroup = ({
  label,
  options,
}: {
  label: string;
  options: string[];
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)}>
        {expanded ? '▾' : '▸'} {label}
      </button>
      {expanded && (
        <ul>
          {options.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FilterPanel = () => (
  <aside>
    <FilterGroup label='Genre' options={['Jazz', 'Rock', 'Techno']} />
    <FilterGroup label='Decade' options={['1970s', '1980s', '1990s']} />
  </aside>
);

export const App1 = () => {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div>
      <button onClick={() => setShowFilters((s) => !s)}>
        {showFilters ? 'Hide' : 'Show'} filters
      </button>
      <Activity mode={showFilters ? 'visible' : 'hidden'}>
        <FilterPanel />
      </Activity>
      <main>
        <p>Pick a filter to narrow down the records.</p>
      </main>
    </div>
  );
};
