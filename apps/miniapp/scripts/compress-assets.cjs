const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const assetsRoot = path.join(__dirname, '../src/assets')

async function compressImage(input, output, options) {
  const before = fs.statSync(input).size
  let pipeline = sharp(input).rotate()

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: options.fit || 'inside',
      withoutEnlargement: true,
    })
  }

  const ext = path.extname(output).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: options.quality ?? 78, mozjpeg: true })
  } else {
    pipeline = pipeline.png({
      quality: options.quality ?? 80,
      compressionLevel: 9,
      palette: true,
      effort: 10,
    })
  }

  await pipeline.toFile(output)

  if (path.resolve(input) !== path.resolve(output) && fs.existsSync(input)) {
    fs.unlinkSync(input)
  }

  const after = fs.statSync(output).size
  const meta = await sharp(output).metadata()
  console.log(
    `${path.basename(output)}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB (${meta.width}x${meta.height})`,
  )
}

async function compressDir(dir, options) {
  const files = fs.readdirSync(dir).filter((name) => /\.(png|jpe?g)$/i.test(name))
  for (const name of files) {
    const input = path.join(dir, name)
    const base = name.replace(/\.(png|jpe?g)$/i, '')
    const output = path.join(dir, `${base}${options.ext}`)
    await compressImage(input, output, options)
  }
}

async function main() {
  console.log('Compressing banners...')
  await compressDir(path.join(assetsRoot, 'banners'), {
    width: 750,
    height: 320,
    fit: 'cover',
    ext: '.jpg',
    quality: 76,
  })

  console.log('Compressing courses...')
  await compressDir(path.join(assetsRoot, 'courses'), {
    width: 400,
    height: 400,
    fit: 'cover',
    ext: '.jpg',
    quality: 78,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
