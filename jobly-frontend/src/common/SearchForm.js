import React, { useState } from "react";
import "./SearchForm.css";

// DOCUMENT HERE
function SearchForm({ searchFor }) {
    console.debug("SearchForm", "searchFor=", typeof searchFor);
    const [searchTerm, setSearchTerm] = useState("");
    
    // DOCUMENT HERE
    function handleSubmit(event) {
        event.preventDefault()
        searchFor(searchTerm.trim() || undefined);
        setSearchTerm(searchTerm.trim());
    }
    // DOCUMENT HERE
    function handleChange(event) {
        setSearchTerm(event.target.value)
    }
    return (
        <div className="SearchForm mb-4">
            <form className="form-inline" onSubmit={handleSubmit}>
                <input
                    className="form-control form-control-lg flex-grow-1"
                    name="searchTerm"
                    placeholder="Enter search term.."
                    value={searchTerm}
                    onChange={handleChange}/>
                <button type="submit" className="btn btn-lg btn-primary">
                    Submit
                </button>
            </form>
        </div>
    )
}

export default SearchForm