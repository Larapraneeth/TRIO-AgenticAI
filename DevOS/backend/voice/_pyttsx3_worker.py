import sys
import pyttsx3


def main():
    out_path = sys.argv[1]
    text = sys.stdin.buffer.read().decode("utf-8", errors="ignore")
    engine = pyttsx3.init()
    engine.save_to_file(text, out_path)
    engine.runAndWait()
    engine.stop()


if __name__ == "__main__":
    main()