import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import api from '../api';
import '../styles/portfolio.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await api.get(`/blog/post/${slug}`);
        setPost(res.data);
      } catch (err) {
        setError(err.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#08080a', color: '#38bdf8', padding: '120px 24px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
        Loading article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#08080a', color: '#ffffff', padding: '120px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Article Not Found</h2>
        <p style={{ color: '#9499ab', marginBottom: '24px' }}>The requested blog post could not be found or is not currently published.</p>
        <Link to="/blog" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>&larr; Back to Blog</Link>
      </div>
    );
  }

  const rawHtml = marked.parse(post.content || '');
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  const displayDate = formatDate(post.published_at || post.created_at);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#08080a', color: '#ffffff', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link to="/blog" style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
            &larr; Back to All Articles
          </Link>
        </div>

        <article className="resume-view-card">
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#5e6375', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span>{displayDate || 'Published'}</span>
            <span>&bull;</span>
            <span>{post.reading_time || 2} min read</span>
            {post.category && (
              <>
                <span>&bull;</span>
                <span style={{ color: '#38bdf8' }}>{post.category}</span>
              </>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', lineHeight: '1.25', marginBottom: '20px' }}>
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {post.tags.map((tag, idx) => (
                <span key={idx} className="timeline-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: '15px',
              color: '#d1d5db',
              lineHeight: '1.8',
              marginTop: '24px'
            }}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </article>
      </div>
    </div>
  );
}
