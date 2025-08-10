import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { projects, categories, projectCategories, documents } from '../lib/db/schema';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema: { projects, categories, projectCategories, documents } });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert categories (with conflict resolution)
    const categoriesData = await db.insert(categories).values([
      { name: 'Oracles', slug: 'oracles' },
      { name: 'Wallets', slug: 'wallets' },
      { name: 'Others', slug: 'others' },
    ]).onConflictDoNothing().returning();

    // If categories already exist, fetch them
    let finalCategories = categoriesData;
    if (categoriesData.length === 0) {
      finalCategories = await db.select().from(categories);
    }

    console.log('✅ Categories ready:', finalCategories.length);

    // Insert projects
    const projectsData = await db.insert(projects).values([
      {
        name: 'Chainlink Oracle',
        description: 'Decentralized oracle network for smart contracts',
        projectUrl: 'https://chain.link',
        twitterUrl: 'https://twitter.com/chainlink',
        status: 'active',
      },
      {
        name: 'Pimlico',
        description: 'Account abstraction infrastructure for smart wallets',
        projectUrl: 'https://pimlico.io',
        twitterUrl: 'https://twitter.com/pimlicoHQ',
        status: 'active',
      },
      {
        name: 'Orby',
        description: 'Advanced wallet infrastructure and tools',
        projectUrl: 'https://orby.network',
        twitterUrl: 'https://twitter.com/orbynetwork',
        status: 'active',
      },
      {
        name: 'Para',
        description: 'Next-generation wallet solutions and protocols',
        projectUrl: 'https://para.fi',
        twitterUrl: 'https://twitter.com/para_fi',
        status: 'active',
      },
      {
        name: 'DeFi Pulse',
        description: 'Real-time analytics dashboard for DeFi protocols',
        projectUrl: 'https://defipulse.com',
        twitterUrl: 'https://twitter.com/defipulse',
        status: 'active',
      },
    ]).returning();

    console.log('✅ Projects created:', projectsData.length);

    // Assign categories to projects
    const [oraclesCat, walletsCat, othersCat] = finalCategories;
    const [chainlink, pimlico, orby, para, defiPulse] = projectsData;

    await db.insert(projectCategories).values([
      // Oracles
      { projectId: chainlink.id, categoryId: oraclesCat.id },
      
      // Wallets
      { projectId: pimlico.id, categoryId: walletsCat.id },
      { projectId: orby.id, categoryId: walletsCat.id },
      { projectId: para.id, categoryId: walletsCat.id },
      
      // Others
      { projectId: defiPulse.id, categoryId: othersCat.id },
    ]);

    console.log('✅ Project categories assigned');

    // Insert example documents
    const documentsData = await db.insert(documents).values([
      {
        projectId: chainlink.id,
        name: 'Developer Documentation',
        description: 'Complete developer guide and API reference',
        githubUrl: 'https://github.com/smartcontractkit/documentation',
        filePath: 'docs/chainlink-dev.md',
        fileName: 'chainlink-dev.md',
        qdrantCollection: `project_${chainlink.id}`,
        chunksCount: 0,
      },
      {
        projectId: pimlico.id,
        name: 'Account Abstraction SDK',
        description: 'SDK for implementing account abstraction',
        githubUrl: 'https://github.com/pimlicolabs/permissionless.js',
        filePath: 'docs/pimlico-sdk.md',
        fileName: 'pimlico-sdk.md',
        qdrantCollection: `project_${pimlico.id}`,
        chunksCount: 0,
      },
      {
        projectId: orby.id,
        name: 'Wallet Infrastructure API',
        description: 'API documentation for wallet infrastructure',
        githubUrl: 'https://github.com/orbynetwork/docs',
        filePath: 'docs/orby-api.md',
        fileName: 'orby-api.md',
        qdrantCollection: `project_${orby.id}`,
        chunksCount: 0,
      }
    ]).returning();

    console.log('✅ Documents created:', documentsData.length);
    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    // Close the connection
    await client.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });