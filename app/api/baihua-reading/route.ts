import { NextRequest, NextResponse } from "next/server";
import { formatBaihuaSource, getBaihuaCaseText, getBaihuaHexagramText, getBaihuaLineText, getBaihuaTopicReading, getBaihuaTopicReadings } from "@/data/baihua-gaodao";
import { divinationTopics } from "@/data/topics";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const primaryName = searchParams.get("primary") ?? "";
  const changedName = searchParams.get("changed") ?? "";
  const movingLine = Number(searchParams.get("line") ?? "0");
  const topic = searchParams.get("topic") ?? "";

  const primary = getBaihuaHexagramText(primaryName);
  const moving = getBaihuaLineText(primaryName, movingLine);
  const changed = getBaihuaHexagramText(changedName);
  const topicReading = getBaihuaTopicReading(moving?.text, topic);
  const topicReadings = getBaihuaTopicReadings(
    moving?.text,
    divinationTopics.map((item) => item.label),
  );
  const caseText = getBaihuaCaseText(moving?.text);

  return NextResponse.json({
    primary: primary
      ? {
          text: primary.text,
          sourceNote: formatBaihuaSource(primary),
        }
      : null,
    moving: moving
      ? {
          marker: moving.marker,
          text: moving.text,
          caseText,
          topicReading,
          topicReadings,
          sourceNote: formatBaihuaSource(primary),
        }
      : null,
    changed: changed
      ? {
          text: changed.text,
          sourceNote: formatBaihuaSource(changed),
        }
      : null,
  });
}
