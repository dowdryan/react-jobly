import React, { useState, useEffect } from "react";
import SearchForm from "../common/SearchForm";
import JoblyApi from "../api";
import CompanyCard from "./CompanyCard";
import LoadingSpinner from "../common/LoadingSpinner";

/** Returns a page listing all companies
 * 
 * 
 */
function CompanyList() {
    console.debug("Company List")
    const [companies, setCompanies] = useState(null)
    useEffect(function getCompaniesOnMount() {
        console.debug("CompanyList useEffect getCompaniesOnMount")
        search()
    }, [])
    // DOCUMENT HERE
    async function search(name) {
        let companies = await JoblyApi.getCompanies(name)
        setCompanies(companies)
    }
    if (!companies) return <LoadingSpinner/>
    return (
        <div className="CompanyList col-md-8 offset-md-2">
            <SearchForm searchFor={search}/>
            {companies.length
                ? (
                    <div className="CompanyList-list">
                        {companies.map(c => (
                            <CompanyCard
                                key={c.handle}
                                handle={c.handle}
                                name={c.name}
                                description={c.description}
                                logoUrl={c.logoUrl}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="lead">Sorry, but we could not find any results.</p>
                )}
        </div>
    )
}

export default CompanyList;