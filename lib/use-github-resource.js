"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

export function useGitHubResource(resource, pageSize = 30) {
  const [repositories, setRepositories] = useState([]);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [repositoryPagination, setRepositoryPagination] = useState(null);
  const [repository, setRepository] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("repository") || "");
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [resourcePage, setResourcePage] = useState(1);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingRepositories(true);
    api.github.repositories({ page: repositoryPage, perPage: pageSize }, { signal: controller.signal })
      .then((response) => {
        setRepositories(response.data.repositories || []);
        setRepositoryPagination(response.data.pagination || null);
        setError("");
        if (response.data.repositories?.length) setRepository((current) => current || response.data.repositories[0].fullName);
      })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setRepositories([]); } })
      .finally(() => { if (!controller.signal.aborted) setLoadingRepositories(false); });
    return () => controller.abort();
  }, [repositoryPage, pageSize, refreshKey]);

  useEffect(() => {
    if (!repository) { setItems(null); setPagination(null); return undefined; }
    const [owner, ...parts] = repository.split("/");
    const repo = parts.join("/");
    if (!owner || !repo) { setError("Select a valid GitHub repository"); return undefined; }
    const controller = new AbortController();
    setLoading(true); setItems(null); setError("");
    api.github.resource(owner, repo, resource, { page: resourcePage, perPage: pageSize }, { signal: controller.signal })
      .then((response) => { setItems(response.data[resource] || []); setPagination(response.data.pagination || null); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setItems([]); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [repository, resource, pageSize, refreshKey, resourcePage]);

  const selectedRepository = useMemo(() => repositories.find((item) => item.fullName === repository), [repositories, repository]);
  const selectRepository = (value) => {
    setResourcePage(1);
    setRepository(value);
  };
  return {
    repositories, selectedRepository, repository, setRepository: selectRepository,
    repositoryPage, setRepositoryPage, repositoryPagination,
    items, pagination, loading, loadingRepositories, error,
    retry: () => setRefreshKey((key) => key + 1),
    next: () => { if (pagination?.nextPage) setResourcePage(pagination.nextPage); },
    previous: () => { if (pagination?.previousPage) setResourcePage(pagination.previousPage); }
  };
}
