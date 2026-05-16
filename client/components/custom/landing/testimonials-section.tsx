import Image from 'next/image'

const testimonials = [
  {
    name: 'Jeeshan',
    role: 'Full-Stack Developer',
    testimonial:
      'BringBucket changed how I manage project assets. I connected my existing S3 bucket in minutes and now have a proper file manager without building one myself.',
    avatar: null,
    initials: 'JE',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    name: 'Saroj Ojha',
    role: 'DevOps Engineer',
    testimonial:
      'We integrated BringBucket into our stack within days, and the benefits were immediate. Our team collaboration improved, deployment times dropped, and the analytics insights have helped us fine-tune performance at every level.',
    avatar: null,
    initials: 'SO',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    name: 'Snehashree Dash',
    role: 'Product Designer',
    testimonial:
      'This product completely changed the way I work. The interface is intuitive and the performance is top-notch.',
    avatar: null,
    initials: 'SD',
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    name: 'Sravesh Nandan',
    role: 'Full Stack Developer',
    testimonial:
      'Clean, fast, and reliable. Everything a dev could ask for. The BYOC model means our assets stay on our own infrastructure.',
    avatar: null,
    initials: 'SN',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    name: 'Kamal',
    role: 'Developer',
    testimonial:
      'The BYOC approach is exactly what we needed for compliance. Our files never leave our own AWS account, which makes our security team happy and keeps us in control.',
    avatar: null,
    initials: 'KM',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    name: 'Janmejay',
    role: 'Developer',
    testimonial:
      "I've used dozens of tools in the past year alone, and this is one of the few I'd actually recommend to other teams. It doesn't just work — it works smart.",
    avatar: null,
    initials: 'JA',
    color: 'bg-cyan-500/10 text-cyan-600',
  },
]

function AvatarSlot({
  avatar,
  initials,
  color,
  name,
}: {
  avatar: string | null
  initials: string
  color: string
  name: string
}) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={48}
        height={48}
        className="size-12 rounded-full ring-2 ring-border ring-offset-[2px] ring-offset-background shrink-0"
        unoptimized
      />
    )
  }

  return (
    <div
      className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-border ring-offset-[2px] ring-offset-background ${color}`}
      aria-hidden
    >
      {initials}
    </div>
  )
}

const Testimonials = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
      <h2 className="text-center font-medium text-4xl tracking-[-0.04em] md:text-[2.75rem]">
        Loved by Our Users
      </h2>
      <p className="mt-2 text-balance text-center text-lg text-muted-foreground tracking-[-0.015em] sm:mt-4 sm:text-2xl">
        Their experiences speak louder than words
      </p>

      <div className="mx-auto mt-16 max-w-5xl columns-1 gap-6 sm:columns-2 lg:columns-3">
        {testimonials.map(({ name, avatar, role, testimonial, initials, color }, index) => (
          <div className="mb-6 break-inside-avoid rounded-lg border bg-muted p-1" key={index}>
            <div className="relative flex flex-col rounded-md border bg-linear-to-bl from-muted/50 via-background to-background px-5 pt-10 pb-3 dark:border-muted-foreground/30 dark:bg-background">
              <span className="absolute top-0 left-4 font-satoshi text-9xl text-foreground/30 select-none pointer-events-none">
                &ldquo;
              </span>

              <p className="grow py-6 font-medium text-lg">{testimonial}</p>
              <div className="mt-2 flex items-center gap-3 py-3.5 sm:mt-4">
                <AvatarSlot avatar={avatar} initials={initials} color={color} name={name} />
                <div className="flex flex-col">
                  <p className="font-medium">{name}</p>
                  <p className="text-muted-foreground text-sm">{role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonials
