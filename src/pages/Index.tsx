import { useState } from "react";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { FileUploadBox } from "@/components/FileUploadBox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertBox } from "@/components/AlertBox";
import { Copy, Shield } from "lucide-react";
import { toast } from "sonner";

interface GenerateResponse {
  description: string;
  model: string;
  timestamp: number;
  cid: string;
}

interface VerifyResponse {
  valid: boolean;
  description?: string;
  model?: string;
  timestamp?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Index = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "verify">("generate");
  
  // Generate state
  const [generateFile, setGenerateFile] = useState<File | null>(null);
  const [generatePreview, setGeneratePreview] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null);

  // Verify state
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyPreview, setVerifyPreview] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);

  const handleGenerateFileSelect = (file: File) => {
    setGenerateFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setGeneratePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setGenerateResult(null);
  };

  const handleGenerateFileRemove = () => {
    setGenerateFile(null);
    setGeneratePreview("");
    setGenerateResult(null);
  };

  const handleGenerate = async () => {
    if (!generateFile) return;

    setIsGenerating(true);
    const formData = new FormData();
    formData.append("image", generateFile);
    formData.append("model", selectedModel);

    console.log("dfdd" + JSON.stringify(API_BASE_URL))
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate description");

      const data: GenerateResponse = await response.json();
      setGenerateResult(data);
      toast.success("Description generated successfully!");
    } catch (error) {
      toast.error("Failed to generate description. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyFileSelect = (file: File) => {
    setVerifyFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVerifyPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setVerifyResult(null);
  };

  const handleVerifyFileRemove = () => {
    setVerifyFile(null);
    setVerifyPreview("");
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    if (!verifyFile) return;

    setIsVerifying(true);
    const formData = new FormData();
    formData.append("image", verifyFile);

    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to verify image");

      const data: VerifyResponse = await response.json();
      setVerifyResult(data);
    } catch (error) {
      toast.error("Failed to verify image. Please try again.");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCID = () => {
    if (generateResult?.cid) {
      navigator.clipboard.writeText(generateResult.cid);
      toast.success("CID copied to clipboard!");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Proof Vault</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Ensuring Authenticity, Integrity, and Trust in an AI-Generated World
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
              activeTab === "generate"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
            }`}
          >
            Generate & Store
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-6 py-3 rounded-xl font-medium transition-smooth ${
              activeTab === "verify"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
            }`}
          >
            Verify Image
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === "generate" && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-semibold mb-6">Generate AI Description</h2>
              
              <FileUploadBox
                onFileSelect={handleGenerateFileSelect}
                onFileRemove={handleGenerateFileRemove}
                preview={generatePreview}
                disabled={isGenerating}
              />

              {generateFile && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Select AI Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground disabled:opacity-50"
                    >
                      <option value="openai">OpenAI Vision</option>
                      {/* <option value="grok">Grok Vision</option> */}
                    </select>
                  </div>

                  <PrimaryButton
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    className="w-full"
                  >
                    Generate Description
                  </PrimaryButton>
                </div>
              )}
            </Card>

            {isGenerating && (
              <Card>
                <LoadingSpinner message="Analyzing image..." />
              </Card>
            )}

            {generateResult && (
              <Card elevated>
                <h3 className="text-xl font-semibold mb-4">Generated Description</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-foreground leading-relaxed">
                      {generateResult.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-accent rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Model</p>
                      <p className="font-medium text-foreground">{generateResult.model}</p>
                    </div>
                    <div className="p-4 bg-accent rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                      <p className="font-medium text-foreground">
                        {formatTimestamp(generateResult.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-accent rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Content ID (CID)</p>
                      <SecondaryButton
                        onClick={handleCopyCID}
                        className="px-4 py-2 text-sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy CID
                      </SecondaryButton>
                    </div>
                    <p className="font-mono text-sm text-foreground break-all">
                      {generateResult.cid}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === "verify" && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-semibold mb-6">Verify Image</h2>
              
              <FileUploadBox
                onFileSelect={handleVerifyFileSelect}
                onFileRemove={handleVerifyFileRemove}
                preview={verifyPreview}
                label="Upload an image to verify"
                disabled={isVerifying}
              />

              {verifyFile && (
                <div className="mt-6">
                  <PrimaryButton
                    onClick={handleVerify}
                    isLoading={isVerifying}
                    className="w-full"
                  >
                    Verify Image
                  </PrimaryButton>
                </div>
              )}
            </Card>

            {isVerifying && (
              <Card>
                <LoadingSpinner message="Checking vault..." />
              </Card>
            )}

            {verifyResult && (
              <Card elevated>
                {verifyResult.valid ? (
                  <>
                    <AlertBox
                      type="success"
                      title="Image Verified ✓"
                      message="This image is verified and has a matching proof in the vault."
                      className="mb-6"
                    />
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Stored Description</h3>
                        <div className="p-4 bg-muted rounded-xl">
                          <p className="text-foreground leading-relaxed">
                            {verifyResult.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-accent rounded-xl">
                          <p className="text-sm text-muted-foreground mb-1">Model</p>
                          <p className="font-medium text-foreground">{verifyResult.model}</p>
                        </div>
                        <div className="p-4 bg-accent rounded-xl">
                          <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                          <p className="font-medium text-foreground">
                            {verifyResult.timestamp && formatTimestamp(verifyResult.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <AlertBox
                    type="error"
                    title="No Match Found"
                    message="No matching proof found in the vault for this image."
                  />
                )}
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground">
            AI Proof Vault - Ensuring Authenticity, Integrity, and Trust in an AI-Generated World
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
