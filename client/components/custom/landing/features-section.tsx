import { Card, CardContent } from '@/components/ui/card'
import { Cloud, ShieldCheck, FolderOpen, BarChart3, KeyRound, CreditCard } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-20 md:py-32 dark:bg-transparent max-w-6xl mx-auto">
      <div className="mx-auto w-full px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">Features</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-5xl">
            Everything you need to manage your own cloud
          </h2>
          <p className="mt-4 text-muted-foreground">
            BYOC gives users the control of personal cloud storage with the simplicity of a modern file management dashboard.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-6 gap-3">

          {/* Card 1 — Bring Your Own Cloud (large, col-span-2 like "100% Customizable") */}
          <Card className="relative col-span-full flex overflow-hidden lg:col-span-2">
            <CardContent className="relative m-auto size-fit pt-6 text-center">
              {/* Cloud upload SVG illustration */}
              <div className="relative flex h-24 w-56 items-center justify-center">
                <svg
                  className="text-muted absolute inset-0 size-full"
                  viewBox="0 0 254 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                    fill="currentColor"
                  />
                </svg>
                <Cloud className="relative z-10 size-12 text-primary" strokeWidth={1} />
              </div>
              <h2 className="mt-6 text-center text-3xl font-semibold">Your Cloud</h2>
              <p className="mt-2 text-sm text-muted-foreground">Connect AWS S3 or any S3-compatible provider</p>
            </CardContent>
          </Card>

          {/* Card 2 — Encrypted Credentials (security visual like "Secure by default") */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                {/* Key/lock fingerprint-style SVG */}
                <svg className="m-auto h-fit w-24" viewBox="0 0 212 143" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className="text-zinc-400 dark:text-zinc-600"
                    d="M44.0209 55.3542C43.1945 54.7639 42.6916 54.0272 42.5121 53.1442C42.3327 52.2611 42.5995 51.345 43.3125 50.3958C50.632 40.3611 59.812 32.5694 70.8525 27.0208C81.8931 21.4722 93.668 18.6979 106.177 18.6979C118.691 18.6979 130.497 21.3849 141.594 26.7587C152.691 32.1326 161.958 39.8936 169.396 50.0417C170.222 51.1042 170.489 52.0486 170.196 52.875C169.904 53.7014 169.401 54.4097 168.688 55C167.979 55.5903 167.153 55.8571 166.208 55.8004C165.264 55.7437 164.438 55.2408 163.729 54.2917C157.236 45.0833 148.885 38.0307 138.675 33.1337C128.466 28.2368 117.633 25.786 106.177 25.7812C94.7257 25.7812 83.9827 28.2321 73.948 33.1337C63.9132 38.0354 55.5903 45.0881 48.9792 54.2917C48.2709 55.3542 47.4445 55.9444 46.5 56.0625C45.5556 56.1806 44.7292 55.9444 44.0209 55.3542ZM126.188 142.656C113.91 139.587 103.875 133.476 96.0834 124.325C88.2917 115.173 84.3959 103.988 84.3959 90.7708C84.3959 84.8681 86.5209 79.9097 90.7709 75.8958C95.0209 71.8819 100.156 69.875 106.177 69.875C112.198 69.875 117.333 71.8819 121.583 75.8958C125.833 79.9097 127.958 84.8681 127.958 90.7708C127.958 94.6667 129.434 97.9439 132.385 100.602C135.337 103.261 138.819 104.588 142.833 104.583C146.847 104.583 150.271 103.256 153.104 100.602C155.938 97.9486 157.354 94.6714 157.354 90.7708C157.354 77.0764 152.337 65.566 142.302 56.2396C132.267 46.9132 120.285 42.25 106.354 42.25C92.4237 42.25 80.441 46.9132 70.4063 56.2396C60.3716 65.566 55.3542 77.0174 55.3542 90.5937C55.3542 93.4271 55.621 96.9687 56.1546 101.219C56.6882 105.469 57.9562 110.427 59.9584 116.094C60.3125 117.156 60.2842 118.101 59.8734 118.927C59.4625 119.753 58.7825 120.344 57.8334 120.698C56.8889 121.052 55.9752 121.024 55.0921 120.613C54.2091 120.202 53.5881 119.522 53.2292 118.573C51.4584 113.969 50.1905 109.395 49.4255 104.853C48.6605 100.31 48.2756 95.6158 48.2709 90.7708C48.2709 75.0694 53.9682 61.9062 65.363 51.2812C76.7577 40.6562 90.3624 35.3437 106.177 35.3437C122.115 35.3437 135.809 40.6562 147.26 51.2812C158.712 61.9062 164.438 75.0694 164.438 90.7708C164.438 96.6736 162.343 101.601 158.155 105.554C153.966 109.506 148.859 111.485 142.833 111.49C136.813 111.49 131.649 109.513 127.342 105.561C123.035 101.608 120.88 96.6783 120.875 90.7708C120.875 86.875 119.43 83.5978 116.54 80.9392C113.65 78.2805 110.196 76.9536 106.177 76.9583C102.163 76.9583 98.7089 78.2876 95.8142 80.9462C92.9195 83.6049 91.4745 86.8797 91.4792 90.7708C91.4792 102.222 94.8745 111.785 101.665 119.458C108.456 127.132 117.22 132.503 127.958 135.573C129.021 135.927 129.729 136.517 130.083 137.344C130.438 138.17 130.497 139.056 130.26 140C130.024 140.826 129.552 141.535 128.844 142.125C128.135 142.715 127.25 142.892 126.188 142.656Z"
                    fill="currentColor"
                  />
                  <g clipPath="url(#clip-key)">
                    <path
                      d="M44.0209 55.3542C43.1945 54.7639 42.6916 54.0272 42.5121 53.1442C42.3327 52.2611 42.5995 51.345 43.3125 50.3958C50.632 40.3611 59.812 32.5694 70.8525 27.0208C81.8931 21.4722 93.668 18.6979 106.177 18.6979C118.691 18.6979 130.497 21.3849 141.594 26.7587C152.691 32.1326 161.958 39.8936 169.396 50.0417C170.222 51.1042 170.489 52.0486 170.196 52.875C169.904 53.7014 169.401 54.4097 168.688 55C167.979 55.5903 167.153 55.8571 166.208 55.8004C165.264 55.7437 164.438 55.2408 163.729 54.2917C157.236 45.0833 148.885 38.0307 138.675 33.1337C128.466 28.2368 117.633 25.786 106.177 25.7812C94.7257 25.7812 83.9827 28.2321 73.948 33.1337C63.9132 38.0354 55.5903 45.0881 48.9792 54.2917C48.2709 55.3542 47.4445 55.9444 46.5 56.0625C45.5556 56.1806 44.7292 55.9444 44.0209 55.3542Z"
                      fill="url(#paint-key)"
                    />
                  </g>
                  <path
                    className="text-primary-600 dark:text-primary-500"
                    d="M3 72H209"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="paint-key" x1="106.385" y1="1.34375" x2="106" y2="72" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0" />
                      <stop className="text-primary-600 dark:text-primary-500" offset="1" stopColor="currentColor" />
                    </linearGradient>
                    <clipPath id="clip-key">
                      <rect width="129" height="72" fill="white" transform="translate(41)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-lg font-medium transition dark:text-white">Encrypted Credentials</h2>
                <p className="text-foreground text-sm">Your cloud keys are encrypted at rest and never exposed inside the application.</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 — Usage Analytics (chart line like "Faster than light") */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="pt-2 lg:px-4">
                <svg className="dark:text-muted-foreground w-full" viewBox="0 0 386 123" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="386" height="123" rx="10" />
                  {/* Axis labels simulating storage/bandwidth data */}
                  <g clipPath="url(#clip-analytics)">
                    <text x="14" y="30" fontSize="11" fill="currentColor" opacity="0.6">Storage</text>
                    <text x="200" y="30" fontSize="11" fill="currentColor" opacity="0.6">Bandwidth</text>
                    <text x="310" y="30" fontSize="11" fill="currentColor" opacity="0.6">Est. Cost</text>
                    <text x="14" y="48" fontSize="14" fontWeight="600" fill="currentColor">42 GB</text>
                    <text x="200" y="48" fontSize="14" fontWeight="600" fill="currentColor">1.2 TB</text>
                    <text x="310" y="48" fontSize="14" fontWeight="600" fill="currentColor">$3.84</text>
                  </g>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 123C3 123 14.3298 94.153 35.1282 88.0957C55.9266 82.0384 65.9333 80.5508 65.9333 80.5508C65.9333 80.5508 80.699 80.5508 92.1777 80.5508C103.656 80.5508 100.887 63.5348 109.06 63.5348C117.233 63.5348 117.217 91.9728 124.78 91.9728C132.343 91.9728 142.264 78.03 153.831 80.5508C165.398 83.0716 186.825 91.9728 193.761 91.9728C200.697 91.9728 206.296 63.5348 214.07 63.5348C221.844 63.5348 238.653 93.7771 244.234 91.9728C249.814 90.1684 258.8 60 266.19 60C272.075 60 284.1 88.057 286.678 88.0957C294.762 88.2171 300.192 72.9284 305.423 72.9284C312.323 72.9284 323.377 65.2437 335.553 63.5348C347.729 61.8259 348.218 82.07 363.639 80.5508C367.875 80.1335 372.949 82.2017 376.437 87.1008C379.446 91.3274 381.054 97.4325 382.521 104.647C383.479 109.364 382.521 123 382.521 123"
                    fill="url(#paint-analytics)"
                  />
                  <path
                    className="text-primary-600 dark:text-primary-500"
                    d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756C56.7349 81.8429 66.6632 80.9723 66.6632 80.9723C66.6632 80.9723 80.0327 80.9723 91.4656 80.9723C102.898 80.9723 100.415 64.2824 108.556 64.2824C116.696 64.2824 117.693 92.1332 125.226 92.1332C132.759 92.1332 142.07 78.5115 153.591 80.9723C165.113 83.433 186.092 92.1332 193 92.1332C199.908 92.1332 205.274 64.2824 213.017 64.2824C220.76 64.2824 237.832 93.8946 243.39 92.1332C248.948 90.3718 257.923 60.5 265.284 60.5C271.145 60.5 283.204 87.7182 285.772 87.756C293.823 87.8746 299.2 73.0802 304.411 73.0802C311.283 73.0802 321.425 65.9506 333.552 64.2824C345.68 62.6141 346.91 82.4553 362.27 80.9723C377.629 79.4892 383 106.605 383 106.605"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="paint-analytics" x1="3" y1="60" x2="3" y2="123" gradientUnits="userSpaceOnUse">
                      <stop className="text-primary/15 dark:text-primary/35" stopColor="currentColor" />
                      <stop className="text-transparent" offset="1" stopColor="currentColor" stopOpacity="0.103775" />
                    </linearGradient>
                    <clipPath id="clip-analytics">
                      <rect width="358" height="30" fill="white" transform="translate(14 14)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="relative z-10 mt-10 space-y-2 text-center">
                <h2 className="text-lg font-medium transition">Usage Analytics</h2>
                <p className="text-foreground text-sm">Track storage, bandwidth, file count, and estimated monthly cost in real time.</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 — File Manager (wide card with waveform/activity graph, col-span-3) */}
          <Card className="card variant-outlined relative col-span-full overflow-hidden lg:col-span-3">
            <CardContent className="grid pt-6 sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                  <FolderOpen className="m-auto size-5" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-zinc-800 transition dark:text-white">File Manager</h2>
                  <p className="text-foreground text-sm">Upload, organize, preview, download, and manage your files with a clean folder-based interface.</p>
                </div>
              </div>
              <div className="rounded-tl-(--radius) relative -mb-6 -mr-6 mt-6 h-fit border-l border-t p-6 py-6 sm:ml-6">
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                </div>
                {/* File tree / folder UI sketch */}
                <div className="mt-4 space-y-2 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">▶</span>
                    <span className="text-foreground font-medium">📁 uploads/</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span>📄 report-q3.pdf</span>
                      <span className="text-muted-foreground">2.4 MB</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>🖼 hero-banner.png</span>
                      <span className="text-muted-foreground">840 KB</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>📦 backup-2024.zip</span>
                      <span className="text-muted-foreground">18.1 MB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-primary">▶</span>
                    <span className="text-foreground font-medium">📁 media/</span>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center justify-between gap-4">
                      <span>🎵 podcast-ep12.mp3</span>
                      <span className="text-muted-foreground">54.2 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5 — Secure Access Control (col-span-3, users/permissions visual) */}
          <Card className="card variant-outlined relative col-span-full overflow-hidden lg:col-span-3">
            <CardContent className="grid h-full pt-6 sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                  <ShieldCheck className="m-auto size-5" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-medium transition">Secure Access Control</h2>
                  <p className="text-foreground text-sm">Control who can access files, generate private links, and manage permissions safely.</p>
                </div>
              </div>
              {/* Permission roles visual (mirrors the users/avatars layout from reference) */}
              <div className="before:bg-(--color-border) relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-6 sm:-mr-6">
                <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                  <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                    <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">Owner</span>
                    <div className="ring-background size-7 ring-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      JD
                    </div>
                  </div>
                  <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                    <div className="ring-background size-8 ring-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-medium text-emerald-600">
                      MK
                    </div>
                    <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">Editor</span>
                  </div>
                  <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                    <span className="block h-fit rounded border px-2 py-1 text-xs shadow-sm">Viewer</span>
                    <div className="ring-background size-7 ring-4 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-medium text-amber-600">
                      SR
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 6 — Transparent Billing (col-span-full on small, 2 on large) */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              {/* Mini billing breakdown visual */}
              <div className="relative mx-auto w-full max-w-[220px]">
                <div className="space-y-2 rounded-lg border p-4 text-xs dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Storage (42 GB)</span>
                    <span className="font-medium">$0.97</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bandwidth (1.2 TB)</span>
                    <span className="font-medium">$2.64</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requests (18k)</span>
                    <span className="font-medium">$0.23</span>
                  </div>
                  <div className="border-t pt-2 dark:border-white/10 flex items-center justify-between font-semibold">
                    <span>Est. Total</span>
                    <span className="text-primary">$3.84 / mo</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[62%] rounded-full bg-primary/70" />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>$0</span>
                  <span>Budget: $6.20</span>
                </div>
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-lg font-medium transition dark:text-white">Transparent Billing</h2>
                <p className="text-foreground text-sm">Estimated storage cost from your connected cloud — no hidden charges.</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 7 — KeyRound / Key Management (col-span-full sm:col-span-3 lg:col-span-2) */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              {/* Key icon centered with radial rings like the fingerprint card */}
              <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                <KeyRound className="m-auto size-12 text-primary" strokeWidth={1} />
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-lg font-medium transition dark:text-white">Key Management</h2>
                <p className="text-foreground text-sm">Rotate, revoke, or update your cloud credentials anytime without downtime.</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 8 — CreditCard / Billing Plan (col-span-2) — wave chart variant */}
          <Card className="relative col-span-full overflow-hidden lg:col-span-2">
            <CardContent className="pt-6">
              <div className="pt-2 lg:px-2">
                <svg className="w-full dark:text-muted-foreground" viewBox="0 0 386 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="386" height="100" rx="10" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 100C3 100 18 75 40 70C62 65 75 68 95 68C115 68 112 52 122 52C132 52 133 75 142 75C151 75 160 62 173 64C186 66 206 75 214 75C222 75 228 52 237 52C246 52 261 76 267 75C273 74 281 48 289 48C295 48 306 70 309 70C317 70 326 55 339 52C352 49 354 66 368 65C374 64.5 378 67 381 72C383 76 383 100 383 100"
                    fill="url(#paint-billing)"
                  />
                  <path
                    className="text-primary-600 dark:text-primary-500"
                    d="M3 98C3 98 18 73.5 40 68.5C62 63.5 75 66.5 95 66.5C115 66.5 112 51 122 51C132 51 133 74 142 74C151 74 160 61 173 63C186 65 206 74 214 74C222 74 228 51 237 51C246 51 261 75 267 74C273 73 281 47 289 47C295 47 306 69 309 69C317 69 326 54 339 51C352 48 354 65 368 64C382 63 383 90 383 90"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="paint-billing" x1="3" y1="48" x2="3" y2="100" gradientUnits="userSpaceOnUse">
                      <stop className="text-primary/15 dark:text-primary/35" stopColor="currentColor" />
                      <stop className="text-transparent" offset="1" stopColor="currentColor" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="relative z-10 mt-8 space-y-2 text-center">
                <h2 className="text-lg font-medium transition dark:text-white">No Hidden Costs</h2>
                <p className="text-foreground text-sm">Pay only what your cloud provider charges — we never add a markup.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}