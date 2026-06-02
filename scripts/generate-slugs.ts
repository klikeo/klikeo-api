import { connectDB, disconnectDB } from '../src/infra/db'
import { NegocioModel } from '../src/repositories/NegocioRepository'
import { slugify } from '../src/utils/slug'

async function main(): Promise<void> {
  await connectDB()

  const negocios = await NegocioModel.find({
    $or: [{ slug: { $exists: false } }, { slug: '' }],
  })

  console.log(`Found ${negocios.length} negocios without slug.`)

  for (const negocio of negocios) {
    const baseSlug = slugify(negocio.name || negocio._id.toString())
    if (!baseSlug) {
      console.warn(`Skipping negocio ${negocio._id} because slug cannot be generated.`)
      continue
    }

    let slug = baseSlug
    let count = 1
    while (await NegocioModel.exists({ slug })) {
      slug = `${baseSlug}-${count++}`
    }

    negocio.slug = slug
    await negocio.save()
    console.log(`Updated negocio ${negocio._id} -> slug=${slug}`)
  }

  console.log('Slug migration complete.')
  await disconnectDB()
}

main().catch((err) => {
  console.error('Slug migration failed:', err)
  process.exit(1)
})
