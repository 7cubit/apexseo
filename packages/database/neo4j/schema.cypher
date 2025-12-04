// Constraints
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT site_id_unique IF NOT EXISTS FOR (s:Site) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT page_url_unique IF NOT EXISTS FOR (p:Page) REQUIRE p.url IS UNIQUE;

// Admin Constraints
CREATE CONSTRAINT admin_email_unique IF NOT EXISTS FOR (a:Admin) REQUIRE a.email IS UNIQUE;
CREATE CONSTRAINT admin_id_unique IF NOT EXISTS FOR (a:Admin) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT keyword_id_unique IF NOT EXISTS FOR (k:Keyword) REQUIRE k.id IS UNIQUE;
CREATE CONSTRAINT cluster_id_unique IF NOT EXISTS FOR (c:Cluster) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;

// Account & Billing Constraints
CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT subscription_id_unique IF NOT EXISTS FOR (s:Subscription) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT plan_id_unique IF NOT EXISTS FOR (p:Plan) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE;

// Indexes
CREATE INDEX page_url_index IF NOT EXISTS FOR (p:Page) ON (p.url);
CREATE INDEX keyword_text_index IF NOT EXISTS FOR (k:Keyword) ON (k.text);
CREATE INDEX entity_name_index IF NOT EXISTS FOR (e:Entity) ON (e.name);

// Relationship Indexes (Neo4j 4.3+)
CREATE INDEX links_to_index IF NOT EXISTS FOR ()-[r:LINKS_TO]-() ON (r.created_at);

// Compound Indexes
CREATE INDEX site_crawled_at_index IF NOT EXISTS FOR (p:Page) ON (p.site_id, p.crawled_at);
CREATE INDEX page_rank_index IF NOT EXISTS FOR (p:Page) ON (p.pageRank);
CREATE INDEX community_index IF NOT EXISTS FOR (p:Page) ON (p.communityId);
