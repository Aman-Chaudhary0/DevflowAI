"use client";

export default function GitHubRepositoryPicker({ repositories, value, onChange, pagination, onPrevious, onNext, loading }) {
  return <div className="github-repository-picker" aria-busy={loading}>
    <label htmlFor="github-resource-repository">Repository</label>
    <select id="github-resource-repository" className="input github-repository-select" value={value} onChange={(event) => onChange(event.target.value)} disabled={loading && !repositories.length}>
      <option value="">Select repository</option>
      {repositories.map((repository) => <option key={repository.id} value={repository.fullName}>{repository.fullName}</option>)}
      {value && !repositories.some((repository) => repository.fullName === value) && <option value={value}>{value}</option>}
    </select>
    {pagination?.hasPrevious || pagination?.hasNext ? (
      <>
        <button type="button" className="btn btn-ghost github-repository-page-button" title="Previous repositories" aria-label="Previous repositories" disabled={!pagination?.hasPrevious || loading} onClick={onPrevious}>Previous</button>
        <button type="button" className="btn btn-ghost github-repository-page-button" title="Next repositories" aria-label="Next repositories" disabled={!pagination?.hasNext || loading} onClick={onNext}>Next</button>
      </>
    ) : !loading ? (
      <span className="github-repository-count">{repositories.length} {repositories.length === 1 ? "repository" : "repositories"}</span>
    ) : null}
  </div>;
}
