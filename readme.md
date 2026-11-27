📋 [AI 코딩용] 3D 컬러 체인 볼트 머지 게임 기획서 및 개발 지시문
1. 프로젝트 개요
가칭: 3D Color Chain Bolt Merge (컬러 체인 볼트 머지)
장르: 3D 논리 순서 추론 + 머지(Merge) 퍼즐
목표 플레이 타임: 스테이지당 약 10분 (볼트 30~50개 기준)
핵심 재미: 꼬인 사슬(의존성)을 논리적으로 풀어나가는 끈기 + 같은 색 3개가 합쳐질 때의 도파민
개발 엔진 및 언어: Unity 3D / C# (또는 지정된 환경)
2. 핵심 게임 규칙 (Core Mechanics)
2.1. 기본 오브젝트
볼트 (Bolt / 나사):
3D 보드 위에 배치되는 오브젝트.
속성: ID, Color(색상), IsLocked(잠김 여부), Position(좌표).
체인 (Chain / 사슬):
볼트 간의 '의존성(선후관계)'을 시각적으로 나타내는 연결선.
볼트 A가 볼트 B를 잠그고 있다면, A 위에 B가 얹혀 있거나 사슬로 묶인 형태로 표현.
머지 슬롯 (Merge Slot):
화면 하단에 위치한 일렬의 칸 (최대 7칸).
플레이어가 푼 볼트가 순서대로 쌓이는 공간.
2.2. 플레이 로직
상호작용: 플레이어는 마우스로 '잠기지 않은(Unlocked)' 볼트를 클릭/드래그하여 하단 머지 슬롯으로 보낸다.
잠김 해제 (Dependency Resolution):
볼트 B가 볼트 A에 의해 잠겨있을 때(B.lockedBy == A), A가 먼저 슬롯으로 이동해야만 B의 잠金が 해제되어 클릭 가능해진다.
머지 (Merge):
머지 슬롯에 같은 색깔의 볼트가 3개 모이면 즉시 3개가 제거(머지)되며 슬롯 칸이 비워진다.
머지 시 시각/청각적 피드백(파티클, ASMR 효과음) 발생.
게임 종료 조건:
클리어 (Win): 보드의 모든 볼트가 사라지고, 머지 슬롯도 비어있을 때.
게임 오버 (Lose): 머지 슬롯이 7칸 모두 꽉 찼는데 머지가 발생하지 않을 때.
3. 데이터 구조 및 클래스 설계 (AI 코더 참고용)
AI는 아래 구조를 기반으로 클래스를 설계하십시오.

// 1. 볼트 데이터 클래스
public class BoltData {
    public int id;
    public BoltColor color; // Enum: Red, Blue, Green, Yellow
    public Vector3 position;
    public int lockedByBoltId; // -1이면 잠기지 않은 상태. 특정 볼트의 ID를 가지면 잠긴 상태.
    public bool isRemoved; // 보드에서 제거되었는지 여부
}

// 2. 게임 매니저 (Core Logic)
public class GameManager : MonoBehaviour {
    private List<BoltData> boardBolts; // 보드에 남은 볼트
    private List<BoltColor> mergeSlots; // 하단 슬롯 (최대 7)
    private const int MAX_SLOTS = 7;

    public void OnBoltClicked(int boltId) { ... }
    private void CheckMerge() { ... } // 3개 동일 색 제거 로직
    private void CheckGameState() { ... } // Win/Lose 체크
}

4. 레벨 생성 알고리즘 (매우 중요)
랜덤 배치는 '풀 수 없는 스테이지'를 양산할 수 있으므로, 역방향 생성 알고리즘(Reverse Generation) 을 사용하십시오.
색상 풀 생성: 4가지 색상을 각각 3의 배수(예: 각 9개씩, 총 36개)로 준비.
순서 역추적:
먼저 풀어야 할 볼트(리프 노드)부터 순서를 정한다.
나중에 풀릴 볼트(루트 노드)를 먼저 보드에 배치하고, lockedBy를 앞서 배치한 볼트의 ID로 할당.
순환 참조 방지: A가 B를 잠그고, B가 A를 잠그는 순환 참조(Cycle)가 발생하지 않도록 DAG(유향 비순환 그래프) 구조를 유지할 것.
5. UI/UX 및 연출 가이드
시각적 피드백:
잠긴 볼트: 색상을 어둡게(Gray out) 하고, 자물쇠 아이콘이나 불투명 오버레이 표시.
풀 수 있는 볼트: 밝은 색상 유지 + 살짝 부유하는(Hover) 애니메이션.
체인(사슬): 잠긴 볼트와 잠금 볼트 사이에 3D 튜브나 체인 메시로 연결.
청각적 피드백 (ASMR):
볼트 클릭/이동: 금속 나사가 풀리는 '드르륵- 탁' 소리.
머지 발생: 통통 튀는 '퐁- 팡!' 하는 쾌감 있는 소리.
게임 오버: 유리가 깨지거나 무거운 금속이 떨어지는 소리.
6. 🤖 Qwen Code (AI) 를 위한 특별 지시사항
이 기획서를 바탕으로 코드를 작성할 때 다음 규칙을 반드시 준수하십시오.
모듈화: GameManager(전체 흐름), BoltController(볼트 상호작용), SlotManager(머지 슬롯), LevelGenerator(스테이지 생성)로 클래스를 분리하십시오.
주석: 각 함수의 역할과 로직의 의도를 한국어로 상세히 주석 처리하십시오.
확장성: 색상 종류, 슬롯 최대 개수, 볼트 총개수 등은 Inspector나 Config 파일에서 쉽게 조절할 수 있도록 SerializeField 또는 상수로 분리하십시오.
에러 핸들링: 머지 슬롯이 꽉 찼을 때 추가 입력을 막는 등, 논리적 에러가 발생하지 않도록 방어 코드를 작성하십시오.
코드 출력: Unity C# 기반의 완전한 스크립트 코드를 마크다운 코드 블록으로 제공하되, 3D 모델링/애니메이션 부분은 // TODO: 3D 모델 및 애니메이션 연결 주석으로 대체하고, 순수 로직과 시스템 구현에 집중하십시오.

먼저 GameManager, BoltController, SlotManager, LevelGenerator의 C# 스크립트 초안을 작성해 주세요. 3D 그래픽 관련 코드는 더미(Dummy)로 처리하고, 순수 게임 로직과 데이터 구조가 완벽하게 돌아가도록 짜주세요