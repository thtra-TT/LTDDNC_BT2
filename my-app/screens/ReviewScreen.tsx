import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform,
  SafeAreaView, ScrollView,
} from "react-native";
import api from "../services/api";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
  star:        "#FFC107",
  starOff:     "#D8E8F8",
};

// ─── Star label helper ────────────────────────────────────────────────────────
const STAR_LABELS = ["", "Tệ", "Không hay", "Bình thường", "Khá hay", "Tuyệt vời!"];
const STAR_COLORS = ["", "#E53935", "#FF7043", "#FFC107", "#66BB6A", "#1E88E5"];

export default function ReviewScreen() {
  const { params }  = useRoute<any>();
  const navigation  = useNavigation<any>();
  const { book_id, order_id } = params;

  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const sendReview = async () => {
    setLoading(true);
    try {
      const res = await api.post("/reviews", { book_id, order_id, rating, comment });
      Alert.alert("Thành công", res.data.message);

      if (res.data.reward.type === "points") {
        Alert.alert("🎉 Bạn được +10 điểm tích lũy");
      } else {
        Alert.alert("🎉 Bạn được tặng mã giảm giá: " + res.data.reward.code);
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── TOP BAR ───────────────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarBlob} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── REWARD HINT ─────────────────────────────────────── */}
        <View style={s.rewardBanner}>
          <View style={s.rewardIconWrap}>
            <Text style={{ fontSize: 22 }}>🎁</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.rewardTitle}>Nhận thưởng khi đánh giá</Text>
            <Text style={s.rewardSub}>+10 điểm tích lũy hoặc mã giảm giá hấp dẫn</Text>
          </View>
        </View>

        {/* ── STAR RATING CARD ────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Chất lượng sản phẩm</Text>

          {/* Stars */}
          <View style={s.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={s.starBtn}
              >
                <Text style={[s.starChar, { color: rating >= star ? C.star : C.starOff }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Star label */}
          <View style={[s.starLabelWrap, { backgroundColor: STAR_COLORS[rating] + "18" }]}>
            <Text style={[s.starLabelTxt, { color: STAR_COLORS[rating] }]}>
              {STAR_LABELS[rating]}
            </Text>
          </View>

          {/* 5 dot indicators */}
          <View style={s.dotRow}>
            {[1,2,3,4,5].map(i => (
              <View
                key={i}
                style={[
                  s.dot,
                  i <= rating && { backgroundColor: STAR_COLORS[rating], transform: [{ scale: 1.2 }] }
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── COMMENT CARD ────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Nhận xét của bạn</Text>
          <TextInput
            style={[s.textarea, focused && s.textareaFocused]}
            placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
            placeholderTextColor={C.text3}
            multiline
            value={comment}
            onChangeText={setComment}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{comment.length} ký tự</Text>
        </View>

        {/* ── TIPS ─────────────────────────────────────────────── */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Gợi ý viết đánh giá hay</Text>
          {[
            "Nội dung, chủ đề và cốt truyện có thú vị không?",
            "Cách trình bày, dịch thuật có dễ hiểu không?",
            "Bạn có giới thiệu cuốn sách này cho bạn bè không?",
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipTxt}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── SUBMIT ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnLoading]}
          onPress={sendReview}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <Text style={s.submitBtnTxt}>Đang gửi...</Text>
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#FFF" />
              <Text style={s.submitBtnTxt}>Gửi đánh giá</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // ── Top bar
  topBar: {
    backgroundColor: C.primaryMid,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16, paddingHorizontal: 14,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  topBarBlob: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)", top: -50, right: -30,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  topBarTitle: { fontSize: 17, fontWeight: "800", color: "#FFF" },

  scroll: { padding: 16, gap: 14 },

  // ── Reward banner
  rewardBanner: {
    backgroundColor: C.primarySoft,
    borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  rewardIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.surface,
    justifyContent: "center", alignItems: "center",
  },
  rewardTitle: { fontSize: 14, fontWeight: "800", color: C.text1, marginBottom: 3 },
  rewardSub:   { fontSize: 12, color: C.text2, lineHeight: 18 },

  // ── Card
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 18,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
    gap: 14,
  },
  cardLabel: { fontSize: 15, fontWeight: "800", color: C.text1 },

  // Stars
  starRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
  starBtn: { padding: 4 },
  starChar: { fontSize: 44 },

  starLabelWrap: {
    alignSelf: "center", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 6,
  },
  starLabelTxt: { fontSize: 15, fontWeight: "800" },

  dotRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.border,
  },

  // Textarea
  textarea: {
    height: 120,
    backgroundColor: C.bg,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, padding: 14,
    fontSize: 14, color: C.text1,
    lineHeight: 22,
  },
  textareaFocused: {
    borderColor: C.primaryMid,
    backgroundColor: C.primarySoft,
  },
  charCount: {
    textAlign: "right", fontSize: 12, color: C.text3,
    marginTop: -6,
  },

  // Tips
  tipsCard: {
    backgroundColor: C.surface, borderRadius: 20, padding: 16,
    gap: 10,
    borderWidth: 1, borderColor: C.border,
  },
  tipsTitle: { fontSize: 13, fontWeight: "700", color: C.text2 },
  tipRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipDot:    {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.primaryMid, marginTop: 6, flexShrink: 0,
  },
  tipTxt:    { flex: 1, fontSize: 13, color: C.text3, lineHeight: 20 },

  // Submit
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 17,
    elevation: 5,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.30, shadowRadius: 12,
  },
  submitBtnLoading: { backgroundColor: C.text3, elevation: 0, shadowOpacity: 0 },
  submitBtnTxt:     { color: "#FFF", fontSize: 16, fontWeight: "800" },
});