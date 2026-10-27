"use client";

export default function GitHubRepositoryPicker({ repositories, value, onChange, pagination, onPrevious, onNext, loading }) {
  return <div className="flex gap-2 items-center flex-wrap" aria-busy={loading}>
    <label className="muted text-sm" htmlFor="github-resource-repository">Repository</label>
    <select id="github-resource-repository" className="input" value={value} onChange={(event) => onChange(event.target.value)} disabled={loading && !repositories.length}>
      <option value="">Select repository</option>
      {repositories.map((repository) => <option key={repository.id} value={repository.fullName}>{repository.fullName}</option>)}
      {value && !repositories.some((repository) => repository.fullName === value) && <option value={value}>{value}</option>}
    </select>
    <button type="button" className="btn btn-ghost" disabled={!pagination?.hasPrevious || loading} onClick={onPrevious}>Previous repositories</button>
    <button type="button" className="btn btn-ghost" disabled={!pagination?.hasNext || loading} onClick={onNext}>Next repositories</button>
  </div>;
}
