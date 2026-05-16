import React from 'react'
import { useSearchParams } from 'react-router-dom'

const SortOption = () => {
  const [searchparams, setSearchParams] = useSearchParams();

  const handlesortChange = (e) => {
    const sortby = e.target.value;

    const params = new URLSearchParams(searchparams);
    params.set("sortby", sortby);

    setSearchParams(params);
  };

  return (
    <div className='mb-4 flex items-center justify-end'>
      <select
        id="sort"
        onChange={handlesortChange}
        value={searchparams.get("sortby") || ""}
        className="border p-2 rounded-md focus:outline-none"
      >
        <option value="">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
};

export default SortOption;