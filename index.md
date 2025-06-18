---
layout: default
title: Home
nav_order: 0
---

# EGRFC Playbook 2025/26

This playbook serves as an illustrative guide to the club's playing style, principles, and strategies. It is designed to be a living document that will evolve as we learn and grow throughout the season.

The playbook is divided into several sections, each focusing on different aspects of our game. We encourage all players and coaches to familiarise themselves with the content and contribute to its development through continuous feedback.
  
<div class="home-toc">
<ol>
  {% assign sorted_pages = site.pages | sort: "url" %}
  {% for page in sorted_pages %}
    {% assign segments = page.url | split: '/' %}
    {% assign depth = segments | size %}

    {% if depth == 2 and page.title %}
      <li>
        <a href="{{ page.url | relative_url }}">{{ page.title }}</a>

        {% assign parent_url = page.url %}
        {% assign children = site.pages | where_exp: "p", "p.url != parent_url and p.url contains parent_url" %}
        {% assign child_pages = children | sort: "url" %}
        {% assign shown = false %}

        <ul>
        {% for child in child_pages %}
          {% assign child_segments = child.url | split: '/' %}
          {% assign child_depth = child_segments | size %}

          {% if child_depth == 3 and child.title %}
            <li>
              <a href="{{ child.url | relative_url }}">{{ child.title }}</a>

              {% assign grandparent_url = child.url %}
              {% assign grand_children = site.pages | where_exp: "c", "c.url != grandparent_url and c.url contains grandparent_url" %}
              {% assign grandchild_pages = grand_children | sort: "url" %}

              {% if grandchild_pages.size > 0 %}
                <ul>
                  {% for grandchild in grandchild_pages %}
                    {% assign g_segments = grandchild.url | split: '/' %}
                    {% assign g_depth = g_segments | size %}
                    {% if g_depth == 4 and grandchild.title %}
                      <li><a href="{{ grandchild.url | relative_url }}">{{ grandchild.title }}</a></li>
                    {% endif %}
                  {% endfor %}
                </ul>
              {% endif %}
            </li>
          {% endif %}
        {% endfor %}
        </ul>

      </li>
    {% endif %}
  {% endfor %}
</ol>
</div>


<!-- Authors (with placeholder content) -->
## Authors
- **Dan Poulton** - _Director of Rugby_ / _Head Coach_
- **Sam Lindsay-McCall** - _Lineout Coach_
