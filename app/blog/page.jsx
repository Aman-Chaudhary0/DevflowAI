"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, FileText, LockKeyhole, Search, Sparkles, Workflow } from "lucide-react";
import { posts } from "@/lib/data";

const categories = ["All articles", ...new Set(posts.map((post) => post.category))];
const artwork = { AI: Sparkles, Workflow, Design: FileText, Security: LockKeyhole };

function ArticleArtwork({ post, featured = false }) {
  const Icon = artwork[post.category] || FileText;
  return (
    <div className={`blog-artwork${featured ? " featured" : ""}`}>
      <div className="blog-artwork-orb" />
      <div className="blog-artwork-grid" />
      <span className="blog-artwork-icon"><Icon size={featured ? 36 : 28} strokeWidth={1.5} /></span>
      <span className="blog-artwork-label">DEVFLOW / {post.category.toUpperCase()}</span>
      {featured && <strong>Ideas for<br />better flow.</strong>}
    </div>
  );
}

function ArticleMeta({ post }) {
  return <div className="blog-article-meta"><span><CalendarDays size={13} />{post.date}</span><i /><span><Clock3 size={13} />{post.read} read</span></div>;
}

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All articles");
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === "All articles" || post.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const [featured, ...remaining] = filteredPosts;

  return (
    <div className="blog-index">
      <section className="blog-index-hero">
        <div className="container">
          <span className="eyebrow">The Devflow journal</span>
          <h1>Ideas for teams<br /><span>building in flow.</span></h1>
          <p>Practical notes on AI, software delivery, and creating calmer developer workflows.</p>
          <label className="blog-search"><Search size={17} /><input aria-label="Search articles" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles, topics..." />{query && <button type="button" onClick={() => setQuery("")}>Clear</button>}<kbd>/</kbd></label>
        </div>
      </section>

      <section className="section-tight blog-listing-section">
        <div className="container">
          <div className="blog-toolbar">
            <div className="blog-category-filters" aria-label="Filter articles by topic">
              {categories.map((category) => <button type="button" key={category} className={activeCategory === category ? "active" : ""} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
            </div>
            <span className="blog-result-count">{filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}</span>
          </div>

          {featured ? (
            <>
              <Link className="blog-featured-card" href={`/blog/${featured.slug}`}>
                <ArticleArtwork post={featured} featured />
                <div className="blog-featured-copy"><span className="blog-featured-label">FEATURED ARTICLE</span><span className="badge">{featured.category}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><ArticleMeta post={featured} /><span className="blog-read-link">Read article <ArrowRight size={15} /></span></div>
              </Link>

              {remaining.length > 0 && <div className="blog-articles-heading"><div><span className="eyebrow">Keep exploring</span><h2>More from the journal</h2></div><span>{remaining.length} articles</span></div>}
              <div className="blog-article-grid">
                {remaining.map((post) => <Link className="blog-article-card" href={`/blog/${post.slug}`} key={post.slug}><ArticleArtwork post={post} /><div className="blog-article-card-copy"><span className="badge">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><ArticleMeta post={post} /><span className="blog-read-link">Read article <ArrowRight size={14} /></span></div></Link>)}
              </div>
            </>
          ) : (
            <div className="blog-empty"><span><Search size={20} /></span><h2>No articles found</h2><p>Try a different search or choose another topic.</p><button className="btn btn-outline" type="button" onClick={() => { setQuery(""); setActiveCategory("All articles"); }}>Clear filters</button></div>
          )}
        </div>
      </section>

      <section className="blog-subscribe-cta"><div className="container"><div><span><Sparkles size={16} /></span><div><strong>Building something with AI?</strong><p>Explore the tools and workflows in Devflow AI.</p></div></div><Link className="btn btn-primary" href="/features">Explore Devflow <ArrowRight size={15} /></Link></div></section>
    </div>
  );
}
