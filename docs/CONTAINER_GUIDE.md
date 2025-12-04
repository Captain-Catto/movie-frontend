# Container Component - Usage Guide

Reusable container component for consistent page layouts.

## Import

```tsx
import { Container } from "@/components/ui/Container";
```

## Basic Usage

### Default Container (Content Pages)
For movie grids, browse pages, etc. - `max-w-7xl` (1280px)

```tsx
<Container>
  <h1>Movies</h1>
  <MovieGrid movies={movies} />
</Container>
```

### Narrow Container (Forms/Settings)
For account pages, login forms - `max-w-4xl` (896px)

```tsx
<Container size="narrow">
  <h1>Account Settings</h1>
  <SettingsForm />
</Container>
```

### Wide Container
For very wide content - `max-w-screen-2xl` (1536px)

```tsx
<Container size="wide">
  <WideContentGrid />
</Container>
```

### Full Width (No Limit)
For hero sections, video players

```tsx
<Container size="full">
  <HeroSection />
</Container>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"default" \| "narrow" \| "wide" \| "full"` | `"default"` | Container max-width |
| `padding` | `"default" \| "tight" \| "none"` | `"default"` | Padding preset |
| `withHeaderOffset` | `boolean` | `false` | Add top padding for fixed header |
| `as` | `React.ElementType` | `"div"` | HTML element to render |
| `className` | `string` | `undefined` | Additional CSS classes |

## Examples

### Content Page with Header Offset
```tsx
<Layout>
  <Container withHeaderOffset>
    <h1>Browse Movies</h1>
    <MovieGrid movies={movies} />
  </Container>
</Layout>
```

### Form Page
```tsx
<Layout>
  <Container size="narrow" withHeaderOffset>
    <h1>Login</h1>
    <LoginForm />
  </Container>
</Layout>
```

### Custom Padding
```tsx
<Container padding="tight">
  <TightContent />
</Container>

<Container padding="none" className="py-8">
  <CustomPaddedContent />
</Container>
```

### Custom Element
```tsx
<Container as="section">
  <Content />
</Container>

<Container as="main" withHeaderOffset>
  <MainContent />
</Container>
```

## Migration Examples

### Before (Old Pattern)
```tsx
// ❌ Inconsistent
<div className="container mx-auto px-4 pt-16">
  <Content />
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <Content />
</div>

<div className="max-w-4xl mx-auto">
  <Content />
</div>
```

### After (New Pattern)
```tsx
// ✅ Consistent
<Container withHeaderOffset>
  <Content />
</Container>

<Container>
  <Content />
</Container>

<Container size="narrow">
  <Content />
</Container>
```

## Recommended Usage by Page Type

| Page Type | Size | Example |
|-----------|------|---------|
| Movie List/Grid | `default` | `/movies`, `/tv`, `/trending` |
| Browse/Search | `default` | `/browse`, `/search` |
| Movie Detail | `default` | `/movie/[id]`, `/tv/[id]` |
| Watch Page | `full` or custom | `/watch/[id]` |
| Account/Settings | `narrow` | `/account`, `/settings` |
| Auth Forms | `narrow` | `/login`, `/register` |
| Admin Pages | `wide` or `default` | `/admin/*` |

## Advanced Usage

### Nesting Containers
```tsx
<Container size="full" padding="none">
  <HeroSection />

  <Container>
    <MovieGrid />
  </Container>

  <Container size="narrow" className="py-12">
    <Newsletter />
  </Container>
</Container>
```

### With Layout Component
```tsx
<Layout>
  <Container withHeaderOffset className="py-8">
    <SectionHeader title="Trending Now" />
    <MovieGrid movies={trending} />
  </Container>

  <Container className="py-8">
    <SectionHeader title="Popular" />
    <MovieGrid movies={popular} />
  </Container>
</Layout>
```
