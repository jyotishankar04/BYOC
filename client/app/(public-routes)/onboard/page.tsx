'use client'

import { useState } from 'react'
import { Check, CircleCheck, Cloud, LoaderCircle, Server, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'

// ─── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Provider' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Verify' },
]

interface Provider {
  id: string
  name: string
  description: string
  available: boolean
  color: string
  bgColor: string
}

const PROVIDERS: Provider[] = [
  { id: 'aws', name: 'AWS S3', description: 'Scalable object storage from Amazon Web Services', available: true, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  { id: 'gcp', name: 'Google Cloud Storage', description: 'Scalable buckets on Google Cloud Platform', available: false, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  { id: 'azure', name: 'Azure Blob Storage', description: 'Microsoft Azure cloud object storage', available: false, color: 'text-sky-600', bgColor: 'bg-sky-500/10' },
  { id: 'r2', name: 'Cloudflare R2', description: 'S3-compatible storage with zero egress fees', available: false, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  { id: 'do', name: 'DigitalOcean Spaces', description: 'Simple S3-compatible object storage', available: false, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'b2', name: 'Backblaze B2', description: 'Reliable cloud object storage', available: false, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'wasabi', name: 'Wasabi', description: 'Hot cloud object storage', available: false, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  { id: 'minio', name: 'MinIO', description: 'High-performance S3-compatible storage', available: false, color: 'text-red-600', bgColor: 'bg-red-500/10' },
]

// ─── Onboard Page ──────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Form state
  const [bucketName, setBucketName] = useState('')
  const [region, setRegion] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSelectProvider = (id: string) => {
    if (!PROVIDERS.find((p) => p.id === id)?.available) return
    setSelectedProvider(id)
  }

  const handleNextToDetails = () => {
    if (!selectedProvider) return
    setStep(2)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!bucketName.trim()) newErrors.bucketName = 'Bucket name is required'
    if (!region.trim()) newErrors.region = 'Region is required'
    if (!accessKey.trim()) newErrors.accessKey = 'Access key is required'
    if (!secretKey.trim()) newErrors.secretKey = 'Secret key is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerify = () => {
    if (!validateForm()) return
    setIsVerifying(true)
    setStep(3)

    setTimeout(() => {
      setIsVerifying(false)
      setIsVerified(true)
    }, 2500)
  }

  const progressValue = step === 1 ? 15 : step === 2 ? 50 : isVerified ? 100 : 75

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Logo className="mb-6 size-10" />
      <div className="w-full max-w-5xl">
        <div className="w-full rounded-xl border border-border/70 sm:bg-card sm:p-1 sm:shadow-lg/3">
          <div className="rounded-lg border border-border/70 bg-muted/60 p-8 sm:shadow-sm/2" style={{ minHeight: '480px' }}>
            {/* Step indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={
                        step >= s.id
                          ? 'flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground'
                          : 'flex size-7 items-center justify-center rounded-full border text-[11px] font-semibold text-muted-foreground'
                      }
                    >
                      {step > s.id ? <Check className="size-3.5" /> : s.id}
                    </div>
                    <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="hidden h-px w-8 bg-border sm:block" />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressValue} className="mt-3 h-1.5" />
            </div>

            {/* Heading */}
            <div className="mt-8 text-center">
              <h1 className="text-xl font-semibold tracking-tight">
                Connect your cloud storage
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Use your own cloud provider to store and manage files securely.
              </p>
            </div>

            {/* Step 1: Provider Selection */}
            {step === 1 && (
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-2.5">
                  {PROVIDERS.map((provider) => {
                    const isSelected = selectedProvider === provider.id
                    const isDisabled = !provider.available
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelectProvider(provider.id)}
                        className={
                          isSelected
                            ? 'relative flex flex-col items-start gap-2 rounded-lg border-2 border-primary bg-card p-3.5 text-left transition-all'
                            : isDisabled
                              ? 'relative flex cursor-not-allowed flex-col items-start gap-2 rounded-lg border border-border/50 bg-card/50 p-3.5 text-left opacity-50 transition-all'
                              : 'relative flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3.5 text-left transition-all hover:border-border/80 hover:bg-accent/50'
                        }
                      >
                        <div className="flex w-full items-center justify-between">
                          <div
                            className={
                              `flex size-8 items-center justify-center rounded-lg ${provider.bgColor}`
                            }
                          >
                            <Cloud className={`size-4 ${provider.color}`} />
                          </div>
                          {isSelected && (
                            <CircleCheck className="size-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{provider.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                            {provider.description}
                          </p>
                        </div>
                        <Badge
                          variant={provider.available ? 'default' : 'outline'}
                          className="mt-1"
                        >
                          {provider.available ? 'Available' : 'Coming soon'}
                        </Badge>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    size="lg"
                    disabled={!selectedProvider}
                    onClick={handleNextToDetails}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Bucket Details */}
            {step === 2 && (
              <div className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel htmlFor="bucketName">Bucket name</FieldLabel>
                    <Input
                      id="bucketName"
                      placeholder="my-storage-bucket"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                      aria-invalid={!!errors.bucketName}
                    />
                    {errors.bucketName && (
                      <FieldError errors={[{ message: errors.bucketName }]} />
                    )}
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel htmlFor="region">Region</FieldLabel>
                    <Input
                      id="region"
                      placeholder="us-east-1"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      aria-invalid={!!errors.region}
                    />
                    {errors.region && (
                      <FieldError errors={[{ message: errors.region }]} />
                    )}
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel htmlFor="accessKey">Access key</FieldLabel>
                    <Input
                      id="accessKey"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      aria-invalid={!!errors.accessKey}
                    />
                    {errors.accessKey && (
                      <FieldError errors={[{ message: errors.accessKey }]} />
                    )}
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel htmlFor="secretKey">Secret key</FieldLabel>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="••••••••••••••••••••••"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      aria-invalid={!!errors.secretKey}
                    />
                    {errors.secretKey && (
                      <FieldError errors={[{ message: errors.secretKey }]} />
                    )}
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel htmlFor="endpointUrl">
                      Endpoint URL{' '}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id="endpointUrl"
                      placeholder="https://s3.amazonaws.com"
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                    />
                  </Field>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="size-3.5" />
                  Your credentials will be encrypted before saving.
                </p>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button size="lg" onClick={handleVerify}>
                    Verify Connection
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <div className="mt-10 flex flex-col items-center py-6">
                {isVerifying && !isVerified && (
                  <>
                    <LoaderCircle className="size-10 animate-spin text-primary" />
                    <p className="mt-4 text-sm font-medium">
                      Verifying connection...
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Testing bucket access with provided credentials
                    </p>
                  </>
                )}

                {isVerified && (
                  <>
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="size-7 text-emerald-500" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      Connection verified successfully
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your bucket is ready to use
                    </p>
                    <div className="mt-2 rounded-lg border bg-card px-4 py-2.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Server className="size-3.5" />
                        <span className="font-medium text-foreground">
                          {bucketName}
                        </span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{region}</span>
                      </div>
                    </div>
                    <Button size="lg" className="mt-8 w-full" asChild>
                      <a href="/app">Go to Dashboard</a>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
