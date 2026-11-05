import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import {
  characterRoles,
  characterSkills,
  characterStats,
  characters,
  echoSets,
  syncRuns,
  weapons,
} from '../db/schema'
import { fetchEncoreData, type EncoreData } from './encore'
import { loadSnapshotData } from './snapshot'

export interface SyncResult {
  runId: number
  counts: {
    characters: number
    weapons: number
    echoes: number
  }
}

export async function replaceDatabase(
  data: EncoreData,
): Promise<SyncResult['counts']> {
  return db.transaction(async (tx) => {
    await tx.delete(characterRoles)
    await tx.delete(characterSkills)
    await tx.delete(characterStats)
    await tx.delete(characters)
    await tx.delete(weapons)
    await tx.delete(echoSets)

    if (data.characters.length) {
      await tx.insert(characters).values(
        data.characters.map((character) => ({
          id: character.id,
          name: character.name,
          rarity: character.rarity,
          element: character.element,
          weaponType: character.weaponType,
          avatarUrl: character.avatarUrl ?? null,
          description: character.description ?? null,
        })),
      )

      const stats = data.characters
        .filter((character) => character.stats)
        .map((character) => ({
          characterId: character.id,
          level: character.stats?.level ?? 1,
          hp: character.stats?.hp ?? null,
          atk: character.stats?.atk ?? null,
          def: character.stats?.def ?? null,
          critRate: character.stats?.critRate ?? null,
          critDamage: character.stats?.critDamage ?? null,
          energyRegen: character.stats?.energyRegen ?? null,
        }))

      if (stats.length) {
        await tx.insert(characterStats).values(stats)
      }

      const skills = data.characters.flatMap((character) =>
        character.skills.map((skill, index) => ({
          characterId: character.id,
          name: skill.name,
          type: skill.type,
          description: skill.description,
          sortOrder: index,
        })),
      )

      if (skills.length) {
        await tx.insert(characterSkills).values(skills)
      }

      const roles = data.characters.flatMap((character) =>
        [...new Set(character.roles)].map((role) => ({
          characterId: character.id,
          role,
        })),
      )

      if (roles.length) {
        await tx.insert(characterRoles).values(roles)
      }
    }

    if (data.weapons.length) {
      await tx.insert(weapons).values(
        data.weapons.map((weapon) => ({
          id: weapon.id,
          name: weapon.name,
          rarity: weapon.rarity,
          type: weapon.type,
          baseAtk:
            typeof weapon.baseAtk === 'number'
              ? Math.round(weapon.baseAtk)
              : null,
          subStat: weapon.subStat ?? null,
          description: weapon.description ?? null,
          iconUrl: weapon.iconUrl ?? null,
        })),
      )
    }

    if (data.echoes.length) {
      await tx.insert(echoSets).values(
        data.echoes.map((echo) => ({
          id: echo.id,
          name: echo.name,
          element: echo.element ?? null,
          twoPiece: echo.twoPiece ?? null,
          fivePiece: echo.fivePiece ?? null,
          iconUrl: echo.iconUrl ?? null,
        })),
      )
    }

    return data.counts
  })
}

type DataLoader = () => Promise<EncoreData>

async function syncWith(
  trigger: string,
  loadData: DataLoader,
): Promise<SyncResult> {
  const [run] = await db
    .insert(syncRuns)
    .values({ trigger, status: 'running' })
    .returning({ id: syncRuns.id })

  try {
    console.info('[sync] loading data')
    const data = await loadData()
    console.info(
      `[sync] loaded characters=${data.counts.characters} weapons=${data.counts.weapons} echoes=${data.counts.echoes}`,
    )
    console.info('[sync] writing database')
    const counts = await replaceDatabase(data)
    console.info('[sync] database written')

    await db
      .update(syncRuns)
      .set({
        status: 'success',
        finishedAt: new Date(),
        counts,
      })
      .where(eq(syncRuns.id, run.id))

    return { runId: run.id, counts }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)

    await db
      .update(syncRuns)
      .set({
        status: 'failed',
        finishedAt: new Date(),
        error: message,
      })
      .where(eq(syncRuns.id, run.id))

    throw error
  }
}

export async function runSync(
  trigger = 'manual',
): Promise<SyncResult> {
  return syncWith(trigger, fetchEncoreData)
}

export async function runSyncFromSnapshot(
  trigger = 'manual',
): Promise<SyncResult> {
  return syncWith(trigger, () => loadSnapshotData())
}

