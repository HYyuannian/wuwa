CREATE TABLE "character_roles" (
	"character_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "character_roles_character_id_role_pk" PRIMARY KEY("character_id","role")
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"character_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"hp" integer,
	"atk" double precision,
	"def" double precision,
	"crit_rate" double precision,
	"crit_damage" double precision,
	"energy_regen" double precision,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_stats_character_id_level_pk" PRIMARY KEY("character_id","level")
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rarity" integer NOT NULL,
	"element" text NOT NULL,
	"weapon_type" text NOT NULL,
	"avatar_url" text,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "echo_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"element" text,
	"two_piece" text,
	"five_piece" text,
	"icon_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"counts" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rarity" integer NOT NULL,
	"type" text NOT NULL,
	"base_atk" integer,
	"sub_stat" text,
	"description" text,
	"icon_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_roles" ADD CONSTRAINT "character_roles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_stats" ADD CONSTRAINT "character_stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "character_skills_character_idx" ON "character_skills" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "characters_element_idx" ON "characters" USING btree ("element");--> statement-breakpoint
CREATE INDEX "characters_weapon_type_idx" ON "characters" USING btree ("weapon_type");--> statement-breakpoint
CREATE INDEX "characters_rarity_idx" ON "characters" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "characters_name_idx" ON "characters" USING btree ("name");--> statement-breakpoint
CREATE INDEX "echo_sets_element_idx" ON "echo_sets" USING btree ("element");--> statement-breakpoint
CREATE INDEX "weapons_type_idx" ON "weapons" USING btree ("type");--> statement-breakpoint
CREATE INDEX "weapons_rarity_idx" ON "weapons" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "weapons_name_idx" ON "weapons" USING btree ("name");