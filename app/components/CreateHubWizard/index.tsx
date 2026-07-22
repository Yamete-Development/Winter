import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "../../lib/orpc";
import { createHubSchema } from "../../schemas/hub";
import { WizardSidebar } from "./WizardSidebar";
import { IdentityStep } from "./IdentityStep";
import { DefaultsStep } from "./DefaultsStep";
import { ReviewStep } from "./ReviewStep";
import { INITIAL_FORM, STEP_ITEMS } from "./types";
import type { HubActionData, HubFormValues } from "./types";

const { Text, Title } = Typography;

type CreateHubWizardProps = {
  mode: "inline" | "modal";
  open?: boolean;
  onCancel?: () => void;
  isFirstHub: boolean;
  onCreated?: (hubId: string) => void;
};

export function CreateHubWizard({ mode, open = false, onCancel, isFirstHub, onCreated }: CreateHubWizardProps) {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof HubFormValues, string>>>({});
  
  const createHubMutation = useMutation(orpc.hub.createHub.mutationOptions({
    onSuccess: (data) => {
      if (!data.hubId) return;
      if (handledHubIdRef.current === data.hubId) return;
      handledHubIdRef.current = data.hubId;
      message.success(isFirstHub ? "Your first hub is ready." : "Hub created successfully.");
      onCreated?.(data.hubId);
      onCancel?.();
    },
    onError: (error) => {
      message.error(error.message || "Failed to create hub");
    }
  }));
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<HubFormValues>({ ...INITIAL_FORM });
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const handledHubIdRef = useRef<string | null>(null);

  const isSubmitting = createHubMutation.isPending;
  const isOpen = mode === "inline" || open;
  const canClose = !isSubmitting && !isFirstHub;

  const handleClose = () => {
    if (!canClose || !onCancel) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onCancel();
    }, 180);
  };

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(0);
    setFormData({ ...INITIAL_FORM });
    handledHubIdRef.current = null;
    setIsExiting(false);
    setIsEntering(true);
    requestAnimationFrame(() => setIsEntering(false));
  }, [isOpen]);



  if (!isOpen) return null;

  const updateField = <K extends keyof HubFormValues>(field: K, value: HubFormValues[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextLabel = currentStep === 1 ? "Review Hub" : "Continue";
  const canAdvanceBasics = formData.name.trim().length > 0 && formData.shortDescription.trim().length > 0;

  const handleNext = () => {
    if (currentStep === 0 && !canAdvanceBasics) {
      message.error("Add a hub name and short description before continuing.");
      return;
    }

    setCurrentStep(step => Math.min(step + 1, STEP_ITEMS.length - 1));
  };

  const handleSubmit = () => {
    const parsed = createHubSchema.safeParse(formData);
    if (!parsed.success) {
      const errors: Partial<Record<keyof HubFormValues, string>> = {};
      for (const err of parsed.error.issues) {
        errors[String(err.path[0]) as keyof HubFormValues] = err.message;
      }
      setFieldErrors(errors);
      
      if (errors.name || errors.shortDescription || errors.description) {
        setCurrentStep(0);
      } else if (errors.visibility || errors.language || errors.region || errors.welcomeMessage) {
        setCurrentStep(1);
      }
      return;
    }

    setFieldErrors({});
    createHubMutation.mutate(parsed.data as any);
  };

  const shell = (
    <div
      className="hub-wizard-shell"
      onClick={e => e.stopPropagation()}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        minHeight: 600,
        borderRadius: 16,
        background: "#18181b",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        opacity: isExiting || isEntering ? 0 : 1,
        transform: isExiting || isEntering ? "scale(0.95)" : "scale(1)",
        transition: "opacity 0.18s ease, transform 0.18s ease",
      }}
    >
      {mode === "modal" && canClose && (
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 4,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
        >
          <CloseOutlined style={{ fontSize: 14 }} />
        </button>
      )}

      <WizardSidebar isFirstHub={isFirstHub} currentStep={currentStep} />

      <div className="hub-wizard-content" style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Title level={4} style={{ margin: 0, color: "white", fontWeight: 600 }}>
            {STEP_ITEMS[currentStep].title}
          </Title>
          <Text style={{ color: "#71717a", fontSize: "0.9rem", fontWeight: 500 }}>
            Step {currentStep + 1} of {STEP_ITEMS.length}
          </Text>
        </div>

        <div style={{ flex: 1 }}>
          {currentStep === 0 && (
            <IdentityStep formData={formData} updateField={updateField} fieldErrors={fieldErrors} />
          )}
          {currentStep === 1 && (
            <DefaultsStep formData={formData} updateField={updateField} />
          )}
          {currentStep === 2 && (
            <ReviewStep formData={formData} />
          )}
        </div>

        <div
          className="hub-wizard-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #27272a",
          }}
        >
          {!(isFirstHub && currentStep === 0) && (
            <Button
              size="large"
              type="text"
              onClick={currentStep === 0 ? handleClose : () => setCurrentStep(step => Math.max(step - 1, 0))}
              disabled={isSubmitting}
              style={{ color: "#e4e4e7", padding: "0 16px" }}
            >
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
          )}

          <Button
            size="large"
            type="primary"
            loading={isSubmitting && currentStep === STEP_ITEMS.length - 1}
            onClick={currentStep === STEP_ITEMS.length - 1 ? handleSubmit : handleNext}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "0 32px",
              fontWeight: 500,
            }}
          >
            {currentStep === STEP_ITEMS.length - 1 ? (isFirstHub ? "Create First Hub" : "Create Hub") : nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={980}
        centered
        transitionName=""
        closable={false}
        mask={{ closable: canClose }}
        className="hub-wizard-modal"
        styles={{
          body: { padding: 0 },
          mask: { backdropFilter: 'blur(4px)', transition: 'opacity 0.18s ease' },
        }}
        title={null}
      >
        {shell}
      </Modal>
    );
  }

  return shell;
}
