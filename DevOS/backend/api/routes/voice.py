from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from voice.stt import stt
from voice.tts import tts

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        text = stt.transcribe(audio_bytes)
        if not text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        return {"text": text}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speak")
async def speak(request: TTSRequest):
    try:
        audio_bytes = tts.synthesize(request.text)
        if not audio_bytes:
            raise HTTPException(status_code=503, detail="TTS synthesis failed")
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
