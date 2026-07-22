import Link from "next/link";
import { posts } from "@/lib/data";
import { PageHero, SearchBar } from "@/components/ui-blocks";

const tags = ["AI", "Workflow", "Design", "Security"];
const popularTags = ["Next.js", "AI", "Design", "Security", "Teams"];

export default function BlogPage() {
  const [featured, ...rest] = posts;

  // The component renders a blog page with a hero section, a search bar, trending articles, popular tags, and a newsletter subscription form. It displays the featured article prominently and lists other articles in a grid layout.
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes on AI, product engineering, and developer flow."
        description="Deep dives, launch notes, and practical patterns for building modern developer workspaces."
      >
        <SearchBar placeholder="Search articles" />
        <div className="row wrap center" style={{ gap: 10 }}>
          {tags.map((tag) => (
            <span className="badge" key={tag}>{tag}</span>
          ))}
        </div>
      </PageHero>


      <section className="section-tight">
        <div className="container grid grid-2">
          <Link className="card card-pad stack" href={`/blog/${featured.slug}`}>
            <div className="terminal" style={{ minHeight: 260 }}>{featured.image}</div>
            <span className="badge">{featured.category}</span>
            <h2 className="h2">{featured.title}</h2>
            <p className="muted">{featured.excerpt}</p>
            <span className="soft">{featured.author} / {featured.date}</span>
          </Link>
          <aside className="stack-lg">
            <div className="card card-pad stack">
              <h3 className="h3">Trending</h3>
              {posts.map((post) => (
                <Link className="muted" href={`/blog/${post.slug}`} key={post.slug}>{post.title}</Link>
              ))}
            </div>
            <div className="card card-pad stack">
              <h3 className="h3">Popular tags</h3>
              <div className="row wrap" style={{ gap: 8 }}>
                {popularTags.map((tag) => (
                  <span className="badge" key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="card card-pad stack">
              <h3 className="h3">Newsletter</h3>
              <input className="input" placeholder="Email address" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <div className="grid grid-3">
            {rest.map((post) => (
              <Link className="card card-pad stack" href={`/blog/${post.slug}`} key={post.slug}>
                <div className="terminal">{post.image}</div>
                <span className="badge">{post.category}</span>
                <h3 className="h3">{post.title}</h3>
                <p className="muted">{post.excerpt}</p>
                <span className="soft">{post.author} / {post.read}</span>
              </Link>
            ))}
          </div>
          <div className="center">
            <button className="btn btn-outline" type="button">Load More</button>
          </div>
        </div>
      </section>
    </>
  );
}
